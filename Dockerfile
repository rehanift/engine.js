FROM base

RUN apt-get install -y build-essential uuid-dev git curl python

# Install ZeroMQ

RUN curl -o /home/zmq.tar.gz http://download.zeromq.org/zeromq-3.2.4.tar.gz

RUN cd /home; tar -xzf zmq.tar.gz

RUN cd /home/zeromq-3.2.4; ./configure; make; make install

RUN ldconfig

# Install node

RUN curl -o /home/node.tar.gz http://nodejs.org/dist/v0.10.28/node-v0.10.28-linux-x64.tar.gz

RUN cd /home; tar -xzf node.tar.gz

RUN ln -s /home/node-v0.10.28-linux-x64/bin/node /usr/local/bin/node
RUN ln -s /home/node-v0.10.28-linux-x64/bin/npm /usr/local/bin/npm

#RUN npm install -g git+https://github.com/rehanift/engine.js.git#develop

RUN mkdir -p /home/src/build