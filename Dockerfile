FROM node
COPY . /app
WORKDIR /app
RUN npm i
EXPOSE 3000
ENTRYPOINT ["npm", "start"]