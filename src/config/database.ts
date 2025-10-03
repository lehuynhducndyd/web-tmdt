import mongoose from "mongoose";

const dbState = [
  { value: 0, label: "Disconnected" },
  { value: 1, label: "Connected" },
  { value: 2, label: "Connecting" },
  { value: 3, label: "Disconnecting" }
];


const connection = async () => {
  try {
    const options = {
      // options limit, timeout...
      dbName: process.env.DB_NAME
    }
    await mongoose.connect(process.env.DATABASE_URL, options); // option
    const state = Number(mongoose.connection.readyState);
    console.log(dbState.find(f => f.value === state).label, "to db"); //log connected to db

  } catch (error) {
    console.log('>>> Failed to connect to database', error);
  }

}


export default connection;
