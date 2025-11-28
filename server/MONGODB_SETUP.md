# MongoDB Atlas Setup Guide

Since MongoDB is not installed locally, we'll use **MongoDB Atlas** (free cloud database).

## Steps

### 1. Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account

### 2. Create a Free Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Click "Create Cluster"

### 3. Set Up Database Access
1. In the left sidebar, click **Database Access**
2. Click "Add New Database User"
3. Choose **Password** authentication
4. Username: `medidash` (or your choice)
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### 4. Set Up Network Access
1. In the left sidebar, click **Network Access**
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development only)
4. Click "Confirm"

### 5. Get Connection String
1. Go back to **Database** in the sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` with your database username
7. Replace `<password>` with your database user password
8. Add `/medidash` before the `?` to specify the database name:
   ```
   mongodb+srv://medidash:yourpassword@cluster0.xxxxx.mongodb.net/medidash?retryWrites=true&w=majority
   ```

### 6. Update .env File
Paste your connection string into `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://medidash:yourpassword@cluster0.xxxxx.mongodb.net/medidash?retryWrites=true&w=majority
```

### 7. Seed and Run
```bash
cd server
npm run seed
npm run dev
```

Your backend should now be connected to MongoDB Atlas! 🎉
