const http = require('http');
const path = require('path');
// const fs = require('fs');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const { v4: uuid } = require('uuid');
const cors = require('@koa/cors');

const tickets = [
  {
    id: '1',
    name: 'Sample task 1',
    description: 'Additional info 1',
    status: true,
    created: new Date(),
  },
  {
    id: '2',
    name: 'Sample task 2',
    description: 'Additional info 2',
    status: false,
    created: new Date(),
  },
  {
    id: uuid(),
    name: 'Sample task 3',
    description: 'Additional info 3',
    status: false,
    created: new Date(),
  },
];

function createNewTicket(params) {
  try {
    const { name, description } = params;
    const id = uuid();
    const created = new Date();
    const status = false;
    tickets.push({ id, name, description, status, created });
    return true;
  } catch (err) {
    return err.message;
  }
}

const app = new Koa();
const port = process.env.PORT || 7070;

const public = path.join(__dirname, '/public');
app.use(koaStatic(public));
app.use(
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
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

app.use(async (ctx) => {
  const requestMethod = ctx.request.method;
  const { method, id } = ctx.request.query;

  if (requestMethod === 'GET') {
    switch (method) {
      case 'allTickets':
        ctx.response.body = tickets;
        return;
      case 'ticketById':
        ctx.response.body = tickets.find((ticket) => ticket.id === id);
        return;
      default:
        ctx.response.status = 404;
        return;
    }
  } else if (requestMethod === 'POST') {
    if (method === 'createTicket') {
      ctx.response.body = createNewTicket(ctx.request.body);
    } else {
      ctx.response.status = 404;
    }
  }
});

const server = http.createServer(app.callback());
server.listen(port, () => console.log('Server started'));