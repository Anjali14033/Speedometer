import asyncio
import websockets
import json
import mysql.connector
from mysql.connector import Error

# MySQL connection setup
def create_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",  # Replace with your MySQL host
            user="root",       # Replace with your MySQL username
            password="7000",  # Replace with your MySQL password
            database="speedometer"  # Replace with your database name
        )
        if connection.is_connected():
            print("Connected to MySQL database")
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Insert data into the MySQL table
def insert_data(connection, speed, timestamp):
    try:
        cursor = connection.cursor()
        query = "INSERT INTO speed_data (speed, timestamp) VALUES (%s, %s)"
        cursor.execute(query, (speed, timestamp))
        connection.commit()
        print("Data inserted into MySQL:", speed, timestamp)
    except Error as e:
        print(f"Error inserting data into MySQL: {e}")

# Handle individual client connections
async def handle_connection(websocket, path):
    connection = create_connection()  # Establish MySQL connection
    async for message in websocket:
        try:
            # Parse the received message
            data = json.loads(message)
            speed = data.get("speed")
            timestamp = data.get("timestamp")
            print(f"Received data: {data}")

            # Push data to MySQL
            if connection and connection.is_connected():
                insert_data(connection, speed, timestamp)

            # Send the same data back to the client
            await websocket.send(json.dumps(data))
            print(f"Sent back to client: {data}")

        except Exception as e:
            print(f"Error: {e}")
            break
    if connection and connection.is_connected():
        connection.close()  # Close MySQL connection when done

# Start the WebSocket server
async def main():
    async with websockets.serve(handle_connection, "localhost", 8765):
        print("WebSocket server is running on ws://localhost:8765")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
