FROM node:14 

RUN mkdir -p /app
WORKDIR /app
COPY package*.json /app/
COPY . /app
RUN npm install 
ENV NODE_ENV development
CMD ["npm", "start"]
EXPOSE 80