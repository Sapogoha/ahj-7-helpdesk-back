const http = require('http');
const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const { v4: uuid } = require('uuid');
const cors = require('@koa/cors');
const router = new Router();
const app = new Koa();
const port = process.env.PORT || 7070;
const public = path.join(__dirname, '/public');
const tickets = [
  {
    id: '1',
    name: 'Задание 1',
    description: 'Описание задания 1',
    status: true,
    created: 1651597184204,
  },
  {
    id: '2',
    name: 'Задание 2',
    description: 'Описание задания 2',
    status: false,
    created: 1651597184204,
  },
  {
    id: uuid(),
    name: 'Задание 3',
    description: 'Описание задания 3',
    status: false,
    created: 1651597184204,
  },
];

function createNewTicket(params) {
  try {
    const { name, description } = params;
    const id = uuid();
    const created = Date.now();
    const status = false;
    tickets.push({ id, name, description, status, created });
    return true;
  } catch (err) {
    return err.message;
  }
}

app.use(koaStatic(public));
app.use(
  cors({
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.use(
  koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  })
);

router.get('/tickets', async (ctx) => {
  const { method } = ctx.request.query;
  if (method === 'allTickets') {
    ctx.response.body = tickets;
  }

  if (method === 'ticketById') {
    const { id } = ctx.request.query;
    ctx.response.body = tickets.find((t) => t.id === id);
  }
});

router.post('/tickets', async (ctx) => {
  ctx.response.body = ctx.request.body;
  const { method } = ctx.request.query;
  if (method === 'createTicket') {
    createNewTicket(ctx.request.body);
    ctx.response.status = 204;
  }
});

router.put('/tickets', async (ctx) => {
  const { id } = ctx.request.body;
  const { method } = ctx.request.query;
  const ticket = tickets.find((t) => t.id === id);

  if (method === 'editById') {
    const { name, description } = ctx.request.body;
    ticket.name = name;
    ticket.description = description;
  } else if (method === 'changeStatus') {
    console.log(ticket.status);
    ticket.status ? (ticket.status = false) : (ticket.status = true);
  }

  ctx.response.status = 204;
});

router.delete('/tickets/remove/:id', async (ctx) => {
  const id = ctx.params.id;
  const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);
  tickets.splice(ticketIndex, 1);
  ctx.response.status = 204;
});

app.use(router.routes()).use(router.allowedMethods());
const server = http.createServer(app.callback());
server.listen(port, () => console.log('Server started'));
