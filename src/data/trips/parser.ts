import dayjs from "dayjs";
export interface Trip {
  id: string;
  startPoint: string;
  destination: string;
  duration: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seats: number;
  departureDate: string;
  arrivalDate: string;
}

export interface TripsData {
  trips: Trip[];
}

function generateDepartureDays(tripsData: TripsData): TripsData {
  const currentDate = dayjs();
  const daysInMonth = currentDate.daysInMonth();
  const currentDay = currentDate.date();

  const updatedTrips: Trip[] = [];

  for (let i = currentDay; i <= daysInMonth; i++) {
    tripsData.trips.forEach((trip) => {
      const departureTime = dayjs(trip.departureTime, "HH:mm");
      let newDepartureTime = departureTime;

      if (i % 2 === 0) {
        // even days - basic trip
        newDepartureTime = departureTime;
      } else {
        // odd days - inverted time
        if (departureTime.hour() >= 12) {
          newDepartureTime = departureTime.subtract(12, "hour");
        } else {
          newDepartureTime = departureTime.add(12, "hour");
        }
      }

      const tripDepartureDate = currentDate.add(i - currentDay, "day");

      // Calculate the arrival date based on the departure date and duration
      const durationArray = trip.duration.split(" ");
      const hours = parseInt(durationArray[0]);
      const minutes = parseInt(durationArray[2]);
      const durationInMinutes = hours * 60 + minutes;

      const newDepartureDateTime = tripDepartureDate
        .hour(newDepartureTime.hour())
        .minute(newDepartureTime.minute());

      const tripArrivalDate = newDepartureDateTime.add(
        durationInMinutes,
        "minute"
      );
      const newArrivalTime = dayjs(tripArrivalDate).format("HH:mm");

      const newTrip = {
        ...trip,
        departureTime: newDepartureTime.format("HH:mm"),
        arrivalTime: newArrivalTime,
        departureDate: tripDepartureDate.format("YYYY-MM-DD"),
        arrivalDate: tripArrivalDate.format("YYYY-MM-DD"),
      };
      updatedTrips.push(newTrip);
    });
  }

  return { trips: updatedTrips };
}

export async function getData(lang: "en" | "uk"): Promise<TripsData> {
  const response = await import(`./${lang}.json`);
  const someData = generateDepartureDays(response.default);
  // console.log(someData);
  return someData;
}

export async function getStartPoints(lang: "en" | "uk"): Promise<string[]> {
  const response = await import(`./${lang}.json`);
  return Array.from(
    new Set(response.default.trips.map((trip: Trip) => trip.startPoint))
  ) as string[];
}
export async function getDestinations(lang: "en" | "uk"): Promise<string[]> {
  const response = await import(`./${lang}.json`);
  return Array.from(
    new Set(response.default.trips.map((trip: Trip) => trip.destination))
  ) as string[];
}
