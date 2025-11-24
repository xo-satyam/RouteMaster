# 🚇 RouteMaster – Multi-Modal Journey Planner
**A unified routing system that finds the fastest, cheapest, and most efficient routes across buses, metro, walking, and other transport modes.**

RouteMaster models the transportation network as a **graph** using GTFS data and computes optimal paths using modern algorithms. It integrates with live schedules, transfers, and cost preferences to help users navigate cities smarter.

---

## 📌 Features

### 🔀 Multi-Modal Routing
- Supports **Walking**, **Metro**, **Bus**, **Bike**, and mixed routes
- Switches intelligently based on time, cost, and availability

### 📡 GTFS Integration
- Uses official **Delhi Metro GTFS** dataset
- Parses stops, trips, stop times, routes, and transfers

### 🚦 Smart Pathfinding
- Graph algorithms like **Dijkstra**, **A***, or **Multi-Criteria Shortest Path**
- Considers travel time, wait time, and transfer penalties

### 📍 Interactive API
- Start & destination inputs (lat/lng)
- Preference options → **Fastest / Cheapest / Minimum Transfers**

### 🧩 Modular Architecture
- Clean separation: GTFS parser, graph builder, router, API handler
- Easy to extend for buses, autos, shared mobility, or real-time feeds

---

## 🚀 How to Run the Project

### 1️⃣ Install dependencies

### 2️⃣ Start the server

### 3️⃣ Hit the API route (example)
POST /route
{
"start_lat": 28.6328,
"start_lng": 77.2197,
"end_lat": 28.5222,
"end_lng": 77.2066,
"preference": "cheapest"
}

---

## 🧠 Tech Stack

- **Node.js / Express**
- **GTFS Data Parsing**
- **Graph Algorithms (Dijkstra, A*, Shortest Path)**
- **GeoJSON, Haversine Distance**
- **Modular, Scalable Architecture**

---

## 📚 Current Progress

✔ GTFS integration  
✔ Graph builder (Stations, edges, travel times)  
✔ Base pathfinding logic  
✔ API structure  
⬜ Web UI (upcoming)  
⬜ Live arrival feed  
⬜ Mode scoring system  

---

## 🔮 Future Enhancements

- Real-time metro/bus arrival updates
- Google Maps-style UI
- Cost comparison: Auto, Cab, Metro, Bus
- Machine learning for predicting best routes during peak rush
- Safety scores for night routes

---

## 🧑‍💻 Developer

**Shreyansh "Shrey" Singh**  
Cybersecurity & AI enthusiast | Graph systems | Full-stack learner

---

## ⭐ Want to Contribute?

Pull requests are welcome!  
Feel free to open issues for bugs, new features, or GTFS improvements.
