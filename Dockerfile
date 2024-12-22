# docker run -p 3000:3000 government-spending-dashboard-web 
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Build React app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]