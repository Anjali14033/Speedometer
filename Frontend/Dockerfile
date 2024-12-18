# Step 1: Use an official Node.js image as the base image
FROM node:16-alpine AS build

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json for caching dependencies
COPY package.json package-lock.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application files into the container
COPY . ./

# Step 6: Build the React app for production
RUN npm run build

# Step 7: Use a lightweight web server to serve the built React app
FROM nginx:alpine

# Step 8: Copy the build folder from the previous image into the Nginx server's directory
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose port 80 for the frontend
EXPOSE 80

# Step 10: Start Nginx server
CMD ["nginx", "-g", "daemon off;"]