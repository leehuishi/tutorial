# Use the official Node.js 14 image
FROM node:14-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create a new user 'appuser'
RUN groupadd -r appuser && useradd -r -g appuser -G appuser appuser \
    && chown -R appuser:appuser /usr/src/app

# Change to 'appuser'
USER appuser

# Expose the port on which the app runs
EXPOSE 8080

# Command to run the application
CMD ["node", "app.js"]
