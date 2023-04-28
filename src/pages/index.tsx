import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  getData,
  getDestinations,
  getStartPoints,
  Trip,
} from "@/data/trips/parser";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import { SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { AutoComplete, DatePicker, Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import "dayjs/locale/en";
import enUS from "antd/locale/en_US";
import ukUA from "antd/locale/uk_UA";
import Image from "next/image";
import roadPng from "../../public/static/images/road.jpg";

interface Props {
  trips: Trip[];
  startPoints: string[];
  destinations: string[];
}

export default function Home({ trips, startPoints, destinations }: Props) {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language;
  const router = useRouter();

  const [searchValues, setSearchValues] = useState({
    startPoint: "",
    destination: "",
    date: new Date(),
  });
  const [startPointSuggestions, setStartPointSuggestions] = useState(
    startPoints.map((point) => ({ value: point }))
  );
  const [destinationSuggestions, setDestinationSuggestions] = useState(
    destinations.map((destination) => ({ value: destination }))
  );
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(trips);

  const filterTrips = () => {
    let filtered = trips;

    if (searchValues.startPoint) {
      filtered = filtered.filter(
        (trip) => trip.startPoint === searchValues.startPoint
      );
    }

    if (searchValues.destination) {
      filtered = filtered.filter(
        (trip) => trip.destination === searchValues.destination
      );
    }

    if (searchValues.date) {
      filtered = filtered.filter(
        (trip) =>
          dayjs(trip.departureDate).format("YYYY-MM-DD") ===
          dayjs(searchValues.date).format("YYYY-MM-DD")
      );
    }

    setFilteredTrips(filtered);
  };

  const onSearch = () => {
    filterTrips();
    router.push({
      query: { ...searchValues, date: searchValues.date.toISOString() },
    });
  };

  useEffect(() => {
    setStartPointSuggestions(
      filterOptions(
        startPoints.map((point) => ({ value: point })),
        searchValues.startPoint
      )
    );
  }, [startPoints]);

  useEffect(() => {
    setDestinationSuggestions(
      filterOptions(
        destinations.map((point) => ({ value: point })),
        searchValues.destination
      )
    );
  }, [destinations]);
  const filterOptions = (options: { value: string }[], input: string) => {
    return options.filter((option) =>
      option.value.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSearchValues({ ...searchValues, date: date.toDate() });
    }
  };
  const handleAutoCompleteChange = (name: string, value: string) => {
    setSearchValues({ ...searchValues, [name]: value });
  };

  const handleStartPointSearch = (value: string) => {
    setStartPointSuggestions(
      filterOptions(
        startPoints.map((point) => ({ value: point })),
        value
      )
    );
  };

  const handleDestinationSearch = (value: string) => {
    setDestinationSuggestions(
      filterOptions(
        destinations.map((destination) => ({ value: destination })),
        value
      )
    );
  };

  const getLocale = (language: string) => {
    switch (language) {
      case "en":
        return enUS.DatePicker;
      case "uk":
        return ukUA.DatePicker;
      default:
        return enUS.DatePicker;
    }
  };

  useEffect(() => {
    if (Object.keys(router.query).length === 0) return;
    setSearchValues({
      startPoint: router.query.startPoint as string,
      destination: router.query.destination as string,
      date: new Date(router.query.date as string),
    });
  }, [router.query]);

  return (
    <>
      <div
        style={{
          position: "relative",
          height: 500,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Image
          priority
          style={{
            filter: "brightness(0.6)",
            objectFit: "cover",
          }}
          src={roadPng}
          alt=""
          fill
        />
        <Container>
          <Row className="mt-3 search">
            <Col>
              <AutoComplete
                size={"large"}
                options={startPointSuggestions}
                style={{ width: "100%" }}
                placeholder={t("selectStartPoint") ?? undefined}
                value={searchValues.startPoint}
                onSearch={handleStartPointSearch}
                onChange={(value) =>
                  handleAutoCompleteChange("startPoint", value)
                }
              />
            </Col>
            <Col>
              <AutoComplete
                size={"large"}
                options={destinationSuggestions}
                style={{ width: "100%" }}
                placeholder={t("selectDestination") ?? undefined}
                value={searchValues.destination}
                onSearch={handleDestinationSearch}
                onChange={(value) =>
                  handleAutoCompleteChange("destination", value)
                }
              />
            </Col>
            <Col>
              <DatePicker
                size={"large"}
                value={dayjs(searchValues.date)}
                onChange={handleDateChange}
                format={"DD MMMM"}
                locale={getLocale(lang)}
              />
            </Col>
            <Col>
              <Button
                icon={<SearchOutlined />}
                size={"large"}
                type="primary"
                onClick={onSearch}
              >
                {t("search")}
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
      <Container>
        <Row className="mt-3">
          <Col>
            <h3>{t("popularTrips")}</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <ListGroup>
              {filteredTrips.map((trip, index) => (
                <Card key={index} className={"mb-3"}>
                  <Card.Body>
                    <Row>
                      <Col>
                        <Card.Title>
                          {trip.departureTime}{" "}
                          <span className={"item-date"}>
                            {dayjs(trip.departureDate)
                              .locale(lang)
                              .format("DD MMMM")}
                          </span>
                          <br />
                          <span className={"item-duration"}>
                            {trip.duration}
                          </span>
                        </Card.Title>
                        <Card.Text>
                          {trip.startPoint}
                          <br /> {trip.departureLocation}
                        </Card.Text>
                      </Col>
                      <Col>
                        <Card.Title>
                          {trip.arrivalTime}{" "}
                          <span className={"item-date"}>
                            {dayjs(trip.arrivalDate)
                              .locale(lang)
                              .format("DD MMMM")}
                          </span>
                        </Card.Title>
                        <Card.Text>
                          {trip.destination}
                          <br /> {trip.arrivalLocation}
                        </Card.Text>
                      </Col>
                      <Col className={"select-button-col"} sm={2}>
                        <Card.Title>
                          {trip.price} {t("uah")}
                        </Card.Title>
                        <Link href={`/preorders/${trip.id}`}>
                          <Button size={"large"} type="primary">
                            {t("select")}
                          </Button>
                        </Link>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const locale = context.locale;
  const tripsData = await getData(locale);
  // Fetch start points and destinations here
  const startPoints = await getStartPoints(locale);
  const destinations = await getDestinations(locale);

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      trips: tripsData.trips,
      startPoints,
      destinations,
    },
  };
}
