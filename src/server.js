const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponse');
const jsonHandler = require('./jsonResponse');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlGET = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/getUsers': jsonHandler.getUsers,
  '/notReal': jsonHandler.notReal,
  notFound: jsonHandler.notFound,
};

const urlHEAD = {
  '/getUsers': jsonHandler.getUsersMeta,
  '/notReal': jsonHandler.notRealMeta,
  notFound: jsonHandler.notFound,
};

const urlPOST = {
  '/addUser': jsonHandler.addUser,
  notFound: jsonHandler.notFound,
};

const handlePost = (request, response, parsedUrl) => {
  if (urlPOST[parsedUrl.pathname]) {
    const res = response;
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // on end of upload stream
    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);
      urlPOST[parsedUrl.pathname](request, response, bodyParams);
    });
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  console.dir(request.method);
  // check the request method
  switch (request.method) {
    case 'GET':
      if (urlGET[parsedUrl.pathname]) {
        urlGET[parsedUrl.pathname](request, response, params);
      } else {
        urlGET.notFound(request, response);
      }
      break;
    case 'HEAD':
      if (urlHEAD[parsedUrl.pathname]) { urlHEAD[parsedUrl.pathname](request, response, params); }
      break;
    case 'POST':
      if (urlPOST[parsedUrl.pathname]) { handlePost(request, response, parsedUrl); }
      break;
    default:
      urlGET.notFound(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);
