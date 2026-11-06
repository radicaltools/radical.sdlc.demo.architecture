#!/usr/bin/env node
// Sensor crosses, for the fitness function Order crosses the systems: the repository it runs in as it
// is, the other as the same change has it (its branch change/<n>), else as its main has it, both running
// and talking over HTTP. Only the carrier, another
// company's, stands in. An order goes through every call the Shop makes to the Warehouse, and what the
// Warehouse answers has to come out of the Shop, so a field named differently on each side fails here.
// A repository's sensors.json runs it from that repository's root; both have the file in .agent/system.
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// One run for each repository, though the fitness function reaches every service: these two meet.
const { element } = JSON.parse(process.argv[process.argv.indexOf('--context') + 1])
if (element?.type !== 'container' || !['services/orders', 'services/dispatch'].some((path) => element.paths?.includes(path))) {
  console.log(`${element?.label} is not where the systems meet.`)
  process.exit(0)
}

const DATE = '2026-11-20'
const { name: here } = JSON.parse(readFileSync('package.json', 'utf8'))
const { repositories } = JSON.parse(readFileSync(new URL('../.radical/system.json', import.meta.url), 'utf8'))
const copies = mkdtempSync(join(tmpdir(), 'crosses-'))
const running = []
const server = (address) => new Promise((resolve) => address.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${address.address().port}`)))

/** The change this checkout is on: the pull request's branch in a gate, else the branch checked out. */
const branch = process.env.GITHUB_HEAD_REF || spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).stdout.trim()
const change = /^change\/\d+$/.test(branch) ? branch : null

/** Where each system's code is: this checkout, or a fresh copy of the other's, on this change or main. */
const rootOf = Object.fromEntries(repositories.map(({ name, repo }) => {
  if (here.endsWith(`.${name}`)) return [name, process.cwd()]
  const dir = join(copies, name)
  const onChange = change && spawnSync('git', ['ls-remote', '--exit-code', '--heads', repo, change]).status === 0
  execFileSync('git', ['clone', '-q', '--depth', '1', ...(onChange ? ['--branch', change] : []), repo, dir], { stdio: 'inherit' })
  console.log(`The ${name} as ${onChange ? change : 'main'} has it.`)
  execFileSync('npm', ['ci', '--omit=dev', '--no-audit', '--no-fund', '--silent'], { cwd: dir, stdio: 'inherit' })
  return [name, dir]
}))

/** A free port, asked of the system, so nothing here meets another sensor's service. */
const freeUrl = async () => {
  const probe = createServer()
  const url = await server(probe)
  await new Promise((resolve) => probe.close(resolve))
  return url
}

const start = async (root, service, env) => {
  const url = await freeUrl()
  running.push(spawn('npx', ['tsx', 'src/main.ts'], {
    cwd: join(root, 'services', service),
    detached: true,
    stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, ...env, PORT: new URL(url).port },
  }))
  return url
}

const answers = async (url) => {
  for (const until = Date.now() + 60_000; Date.now() < until; await new Promise((resolve) => setTimeout(resolve, 200))) {
    try {
      await fetch(url)
      return
    } catch {
      // Still starting.
    }
  }
  throw new Error(`${url} does not answer after a minute`)
}

const call = async (method, url, body) => {
  const response = await fetch(url, {
    method,
    ...(body ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {}),
  })
  return { status: response.status, body: await response.json() }
}
const ok = async (method, url, body) => {
  const answer = await call(method, url, body)
  if (answer.status >= 300) throw new Error(`${method} ${url} answered ${answer.status}: ${JSON.stringify(answer.body)}`)
  return answer.body
}
const same = (what, got, wanted) => {
  if (got !== wanted) throw new Error(`${what} is ${JSON.stringify(got)}, not ${JSON.stringify(wanted)}`)
}

let parcels = 0
let date = DATE
const carrier = createServer((request, response) => {
  request.resume()
  request.on('end', () => {
    response.writeHead(request.method === 'POST' ? 201 : 200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(request.method === 'POST'
      ? { trackingNumber: `T-${++parcels}`, ...(date ? { estimatedDeliveryDate: date } : {}) }
      : { status: 'in-transit' }))
  })
})

try {
  const carrierUrl = await server(carrier)
  const stock = await start(rootOf.warehouse, 'stock', {})
  const dispatch = await start(rootOf.warehouse, 'dispatch', { STOCK_URL: stock, CARRIER_URL: carrierUrl })
  const pricing = await start(rootOf.shop, 'pricing', {})
  const notifications = await start(rootOf.shop, 'notifications', {})
  const orders = await start(rootOf.shop, 'orders', { PRICING_URL: pricing, NOTIFICATIONS_URL: notifications, STOCK_URL: stock, DISPATCH_URL: dispatch })
  await Promise.all([stock, dispatch, pricing, notifications, orders].map(answers))

  const sku = 'crosses'
  // An order goes to an address (ticket #22); a Shop from before it takes no address, and ignores one.
  const deliveryAddress = { street: 'Dluga 1', city: 'Warsaw', postalCode: '00-001', country: 'PL' }
  const place = (quantity) => ok('POST', `${orders}/orders`, { lines: [{ sku, unitPrice: 20, quantity }], deliveryAddress })
  const shelf = () => ok('GET', `${stock}/stock/${sku}`)
  await ok('POST', `${stock}/stock/receipts`, { sku, quantity: 5 })

  // Short of goods: POST /reservations answers what is missing.
  const tooMany = await call('POST', `${orders}/orders/${(await place(99)).id}/pay`)
  same('The payment of more than there is', tooMany.status, 409)
  if (!JSON.stringify(tooMany.body.short ?? null).includes(sku)) throw new Error(`The Shop does not say what is short: ${JSON.stringify(tooMany.body)}`)

  // Paid: POST /reservations holds the goods, and the order keeps the reservation's id.
  const order = await place(2)
  const paid = await ok('POST', `${orders}/orders/${order.id}/pay`)
  if (!paid.reservationId) throw new Error(`The paid order has no reservation: ${JSON.stringify(paid)}`)
  same('Held after paying', (await shelf()).held, 2)

  // Shipped: POST /dispatches gives the tracking number, and the goods leave the shelf.
  same('The tracking number', (await ok('POST', `${orders}/orders/${order.id}/ship`)).trackingNumber, 'T-1')
  same('On hand after shipping', (await shelf()).onHand, 3)

  // Tracked: GET /dispatches/{reservationId} gives the carrier's status and date.
  const tracking = await ok('GET', `${orders}/orders/${order.id}/tracking`)
  same('The status of the delivery', tracking.status, 'in-transit')
  same('The estimated delivery date', tracking.estimatedDeliveryDate, DATE)

  const notes = await ok('GET', `${notifications}/notifications?orderId=${order.id}`)
  for (const type of ['placed', 'paid', 'shipped']) {
    if (!notes.some((note) => note.eventId === `${order.id}:order.${type}`)) throw new Error(`Not notified: order.${type}`)
  }

  // Returned: POST /reservations/{id}/return puts the goods back.
  await ok('POST', `${orders}/orders/${order.id}/return`)
  same('On hand after the return', (await shelf()).onHand, 5)

  // The carrier gives no date: it is null all the way.
  date = null
  const undated = await place(1)
  await ok('POST', `${orders}/orders/${undated.id}/pay`)
  await ok('POST', `${orders}/orders/${undated.id}/ship`)
  same('The date the carrier did not give', (await ok('GET', `${orders}/orders/${undated.id}/tracking`)).estimatedDeliveryDate, null)

  console.log(`An order crossed the systems: reserved, dispatched, tracked and returned, with ${Object.keys(rootOf).join(' and ')} running.`)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  for (const child of running) {
    try { process.kill(-child.pid) } catch { /* It stopped by itself. */ }
  }
  carrier.close()
  rmSync(copies, { recursive: true, force: true })
}
