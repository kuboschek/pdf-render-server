# pdf-render-server

pdf-render-server is a stateless service rendering PDF files from multiple inputs.

1. Send a POST to `/` with all files needed in parameter `files`. One of those needs to be index.html
2. Use multipart encoding
3. Server returns a PDF file in the response body


## How to use

* `docker run kuboschek/pdf-render-server -p 3000:3000`
* Send requests


## Not supported

* Files in subfolders
* Templating