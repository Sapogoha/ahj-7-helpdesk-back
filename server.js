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
    created: '1651597184204',
  },
  {
    id: '2',
    name: 'Sample task 2',
    description: 'Additional info 2',
    status: false,
    created: '1651597184204',
  },
  {
    id: uuid(),
    name: 'Sample task 3',
    description: 'Additional info 3',
    status: false,
    created: '1651597184204',
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

// function editTicket(params) {
//   try {
//     const { id, name, description } = params;
//     const ticket = this.tickets.find((t) => t.id === id);
//     ticket.name = name;
//     ticket.description = description;
//     tickets.push(ticket);
//     return true;
//   } catch (err) {
//     return err.message;
//   }
// }

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
    switch (method) {
      case 'createTicket':
        ctx.response.body = createNewTicket(ctx.request.body);
        return;
      // case 'editById':
      //   ctx.response.body = editTicket(ctx.request.body);
      //   return;
      default:
        ctx.response.status = 404;
        return;
    }
  } else if (requestMethod === 'PUT') {
    switch (method) {
      case 'editById':
        const { name, description } = ctx.request.body;
        const thisId = ctx.request.body.id;

        const ticket = this.tickets.find((ticket) => ticket.id === thisId);
        ticket.name = name;
        ticket.description = description;
        ctx.response.status = 204;
        return;

      default:
        ctx.response.status = 404;
        return;
    }
  }
});

const server = http.createServer(app.callback());
server.listen(port, () => console.log('Server started'));
