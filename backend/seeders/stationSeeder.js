// seeding command node seeders/stationSeeder.js
const mongoose = require("mongoose");
const Station = require("../models/stationModel");

const stations = [
  { name: "CST", zone: "Central", latitude: 18.9402, longitude: 72.8356 },
  { name: "Masjid", zone: "Central", latitude: 18.9500, longitude: 72.8353 },
  { name: "Sandhurst Road", zone: "Central", latitude: 18.9621, longitude: 72.8312 },
  { name: "Byculla", zone: "Central", latitude: 18.9766, longitude: 72.8313 },
  { name: "Chinchpokli", zone: "Central", latitude: 18.9904, longitude: 72.8285 },
  { name: "Currey Road", zone: "Central", latitude: 18.9995, longitude: 72.8251 },
  { name: "Parel", zone: "Central", latitude: 19.0090, longitude: 72.8303 },
  { name: "Dadar", zone: "Central", latitude: 19.0182, longitude: 72.8422 },
  { name: "Matunga", zone: "Central", latitude: 19.0270, longitude: 72.8429 },
  { name: "Sion", zone: "Central", latitude: 19.0413, longitude: 72.8535 },
  { name: "Kurla", zone: "Central", latitude: 19.0625, longitude: 72.8805 },
  { name: "Vidyavihar", zone: "Central", latitude: 19.0740, longitude: 72.8889 },
  { name: "Ghatkopar", zone: "Central", latitude: 19.0896, longitude: 72.9080 },
  { name: "Vikhroli", zone: "Central", latitude: 19.1104, longitude: 72.9289 },
  { name: "Kanjurmarg", zone: "Central", latitude: 19.1324, longitude: 72.9358 },
  { name: "Bhandup", zone: "Central", latitude: 19.1443, longitude: 72.9351 },
  { name: "Nahur", zone: "Central", latitude: 19.1555, longitude: 72.9350 },
  { name: "Mulund", zone: "Central", latitude: 19.1730, longitude: 72.9570 },
  { name: "Thane", zone: "Central", latitude: 19.1860, longitude: 72.9756 },
  { name: "Kalva", zone: "Central", latitude: 19.2180, longitude: 72.9998 },
  { name: "Mumbra", zone: "Central", latitude: 19.2434, longitude: 73.0234 },
  { name: "Diva", zone: "Central", latitude: 19.2504, longitude: 73.0389 },
  { name: "Kopar", zone: "Central", latitude: 19.2712, longitude: 73.0577 },
  { name: "Dombivli", zone: "Central", latitude: 19.2163, longitude: 73.0875 },
  { name: "Thakurli", zone: "Central", latitude: 19.2134, longitude: 73.1033 },
  { name: "Kalyan", zone: "Central", latitude: 19.2436, longitude: 73.1319 },
  { name: "Shahad", zone: "Central", latitude: 19.2437, longitude: 73.1537 },
  { name: "Ambivli", zone: "Central", latitude: 19.2500, longitude: 73.1747 },
  { name: "Titwala", zone: "Central", latitude: 19.2732, longitude: 73.1973 },
  { name: "Khadavli", zone: "Central", latitude: 19.3332, longitude: 73.2123 },
  { name: "Vasind", zone: "Central", latitude: 19.3830, longitude: 73.2621 },
  { name: "Asangaon", zone: "Central", latitude: 19.4461, longitude: 73.3211 },
  { name: "Badlapur", zone: "Central", latitude: 19.1661, longitude: 73.2380 },
  { name: "Ambernath", zone: "Central", latitude: 19.1996, longitude: 73.1863 },
  { name: "Ulhasnagar", zone: "Central", latitude: 19.2266, longitude: 73.1578 },
  { name: "Vashi", zone: "Harbour", latitude: 19.0771, longitude: 72.9981 },
  { name: "Sanpada", zone: "Harbour", latitude: 19.0728, longitude: 73.0085 },
  { name: "Juinagar", zone: "Harbour", latitude: 19.0654, longitude: 73.0157 },
  { name: "Nerul", zone: "Harbour", latitude: 19.0330, longitude: 73.0197 },
  { name: "Seawoods", zone: "Harbour", latitude: 19.0183, longitude: 73.0282 },
  { name: "CBD Belapur", zone: "Harbour", latitude: 19.0159, longitude: 73.0351 },
  { name: "Kharghar", zone: "Harbour", latitude: 19.0342, longitude: 73.0631 },
  { name: "Panvel", zone: "Harbour", latitude: 18.9886, longitude: 73.1100 },
  { name: "Airoli", zone: "Harbour", latitude: 19.1550, longitude: 72.9993 },
  { name: "Rabale", zone: "Harbour", latitude: 19.1382, longitude: 73.0047 },
  { name: "Ghansoli", zone: "Harbour", latitude: 19.1257, longitude: 73.0069 },
  { name: "Koparkhairane", zone: "Harbour", latitude: 19.1071, longitude: 73.0094 },
  { name: "Turbhe", zone: "Harbour", latitude: 19.0956, longitude: 73.0050 },
  { name: "Chembur", zone: "Harbour", latitude: 19.0621, longitude: 72.9000 },
  { name: "Govandi", zone: "Harbour", latitude: 19.0578, longitude: 72.9122 },
  { name: "Mankhurd", zone: "Harbour", latitude: 19.0515, longitude: 72.9289 },
  { name: "Vadala Road", zone: "Harbour", latitude: 19.0172, longitude: 72.8471 },
  { name: "Wadala", zone: "Harbour", latitude: 19.0190, longitude: 72.8554 },
  { name: "Sewri", zone: "Harbour", latitude: 18.9931, longitude: 72.8609 },
  { name: "Dockyard Road", zone: "Harbour", latitude: 18.9697, longitude: 72.8444 },
  { name: "Reay Road", zone: "Harbour", latitude: 18.9693, longitude: 72.8440 }

  //add more stations as needed
];

async function seedStations() {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/test`); //db
    for (const station of stations) {
      const exists = await Station.findOne({ name: station.name });
      if (!exists) {
        await Station.create(station);
        console.log(`Added station: ${station.name}`);
      } else {
        console.log(`Station already exists: ${station.name}`);
      }
    }
    console.log("Station seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding stations:", error);
    process.exit(1);
  }
}

seedStations();
