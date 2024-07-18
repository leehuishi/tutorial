# Use the base image you have, assuming node:14-alpine or similar is appropriate
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy taskmanagement_back4-1.0.0.tgz to the Docker image
COPY taskmanagement_back4-1.0.0.tgz ./

# Install npm dependencies from taskmanagement_back4-1.0.0.tgz
RUN npm install ./taskmanagement_back4-1.0.0.tgz

# Copy the rest of the application code
COPY . .

RUN ls -la /app/node_modules/taskmanagement_back4/package.json

RUN echo "Contents of /app/package.json:"
RUN cat /app/package.json

RUN echo "Contents of /app/node_modules/taskmanagement_back4/package.json:"
RUN cat /app/node_modules/taskmanagement_back4/package.json

# Use cmp to compare package.json and exit with status 1 if files are different
RUN cmp -s package.json /app/node_modules/taskmanagement_back4/package.json || { echo "Files are different"; exit 1; }

# No issue with the package.json
# Copy contents of /app/node_modules/taskmanagement_back4/node_modules to /app/node_modules
RUN cp -r /app/node_modules/taskmanagement_back4/node_modules/. /app/node_modules/

# Change working directory inside the container
WORKDIR /app

# Optional: Expose the port on which the app runs
EXPOSE 8080

# Optional: Command to run the application
CMD ["node", "app.js"]
