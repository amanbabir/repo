import React, { useEffect, useState } from "react";
import { Card, Col, Container, Navbar, Row, Modal } from "react-bootstrap";
import {
  Button,
  Steps,
  InputNumber,
  Alert,
  Form,
  Input,
  DatePicker,
  Spin,
} from "antd";
import { GetServerSideProps } from "next";
import { getData, Trip } from "@/data/trips/parser";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import "dayjs/locale/uk";
import "dayjs/locale/en";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import enUS from "antd/locale/en_US";
import ukUA from "antd/locale/uk_UA";

export const NumberInput: React.FC<{
  value: number;
  onChange: any;
}> = ({ value, onChange }) => {
  const [num, setNum] = useState(value);

  return (
    <>
      <InputNumber
        size={"large"}
        className={"passenger-count-number-input"}
        value={num}
        onChange={(v) => {
          v !== null && onChange(v);
          v !== null && setNum(v);
        }}
      />
    </>
  );
};

dayjs.extend(advancedFormat);
dayjs.extend(utc);
interface Props {
  trip: Trip;
}

interface FormData {
  passengers: {
    firstName: string;
    lastName: string;
    dob: string;
  }[];
  email: string;
  phoneNumber: string;
}
const PreorderPage: React.FC<Props> = ({ trip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [passengersCount, setPassengersCount] = useState(1);
  const [passengersCountError, setPassengersCountError] = useState("");

  const { i18n, t } = useTranslation();
  const language = i18n.language;

  const passengersCountSchema = yup.object().shape({
    passengersCount: yup
      .number()
      .required(t("error.passengersRequired") ?? "")
      .min(1, t("error.atLeastOnePassenger") ?? "")
      .max(trip.seats, t("error.maxPassengers", { max: trip.seats }) ?? ""),
  });

  const handlePassengersCountChange = (value: number) => {
    passengersCountSchema
      .validate({ passengersCount: value })
      .then(() => {
        setPassengersCountError("");
        setPassengersCount(value);
      })
      .catch((err) => setPassengersCountError(err.errors[0]));
  };

  const createPassengerValidationSchema = () =>
    yup.array().of(
      yup.object().shape({
        firstName: yup.string().required(t("error.firstNameRequired") ?? ""),
        lastName: yup.string().required(t("error.lastNameRequired") ?? ""),
        dob: yup.date().required(t("error.dobRequired") ?? ""),
      })
    );

  const createValidationSchema = () =>
    yup.object().shape({
      passengers: createPassengerValidationSchema(),
      email: yup
        .string()
        .email(t("error.invalidEmail") ?? "")
        .required(t("error.required") ?? ""),
      phoneNumber: yup
        .string()
        .matches(
          /^(?:\+380|0)\d{2}\d{3}\d{2}\d{2}$/,
          t("error.mustBeNumber") ?? ""
        )
        .required(t("error.required") ?? ""),
    });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitted, isValid },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      passengers: [],
      email: "",
      phoneNumber: "",
    },
    resolver: yupResolver(createValidationSchema()),
  });

  useEffect(() => {
    reset();
  }, [passengersCount]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = () => {
    setLoading(true);
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      setErrorMessage("paymentError");
      setLoading(false);
    }, 5000);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      try {
        await passengersCountSchema.validate({
          passengersCount: passengersCount,
        });
      } catch (err) {
        // @ts-ignore
        setPassengersCountError(err.errors[0]);

        return;
      }
    }
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleStepChange = (current: number) => {
    if (current < currentStep) {
      setCurrentStep(current);
    }
  };

  const formatDate = (date: string, time: string) => {
    const parsedDate = dayjs(`${date}T${time}`).locale(language);
    const dateFormat = "Do MMMM YYYY HH:mm";

    return parsedDate.format(dateFormat);
  };

  return (
    <>
      <Navbar bg={"light"}>
        <Container>
          <Steps
            type="navigation"
            onChange={handleStepChange}
            current={currentStep}
            items={[
              {
                title: t("selectTrip"),
              },
              {
                title: t("passengerCount"),
              },
              {
                title: t("passengersInfo"),
              },
              {
                title: t("payment"),
              },
            ]}
          />
        </Container>
      </Navbar>

      <Navbar bg={"light"}>
        <Container>
          {trip.startPoint} - {trip.destination}
          <br />
          {formatDate(trip.departureDate, trip.departureTime)}
        </Container>
      </Navbar>
      <Container className={"content-container"}>
        <Col className={"main-content"}>
          {currentStep === 0 && (
            <Card className={"trip-step-card"}>
              <Card.Title>{t("freeSeating")}</Card.Title>

              <Button
                className={"mt-5 next-button"}
                type={"primary"}
                size={"large"}
                onClick={handleNext}
              >
                {t("next")}
              </Button>
            </Card>
          )}

          {currentStep === 1 && (
            <Card className={"passenger-count-step-card"}>
              <Card.Title>{t("selectNumberOfPassengers")}</Card.Title>
              <NumberInput
                value={passengersCount}
                onChange={handlePassengersCountChange}
              />
              {passengersCountError && (
                <Alert
                  message={t(passengersCountError)}
                  type="error"
                  className={"mb-3 mt-1"}
                  showIcon
                />
              )}
              {t("availableSeats")} {trip.seats}
              <Button type={"primary"} size={"large"} onClick={handleNext}>
                {t("next")}
              </Button>
            </Card>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              {Array.from({ length: passengersCount }, (_, index) => (
                <>
                  <Card key={index} className={"passenger-form"}>
                    <Card.Title>
                      {t("passengerDetails")} №{index + 1}
                    </Card.Title>
                    <Form layout="vertical">
                      <Row>
                        <Col>
                          <Form.Item
                            label={t("firstName")}
                            validateStatus={
                              errors?.passengers?.[index]?.firstName
                                ? "error"
                                : "success"
                            }
                            help={
                              errors?.passengers?.[index]?.firstName?.message
                            }
                          >
                            <Controller
                              name={`passengers.${index}.firstName`}
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <Input
                                  size={"large"}
                                  id={`firstName[${index}]`}
                                  type="text"
                                  {...field}
                                />
                              )}
                            />
                          </Form.Item>
                        </Col>

                        <Col>
                          <Form.Item
                            label={t("lastName")}
                            validateStatus={
                              errors?.passengers?.[index]?.lastName
                                ? "error"
                                : "success"
                            }
                            help={
                              errors?.passengers?.[index]?.lastName?.message
                            }
                          >
                            <Controller
                              name={`passengers.${index}.lastName`}
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <Input
                                  size={"large"}
                                  id={`lastName[${index}]`}
                                  type="text"
                                  {...field}
                                />
                              )}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Item
                            label={t("dob")}
                            validateStatus={
                              errors?.passengers?.[index]?.dob
                                ? "error"
                                : "success"
                            }
                            help={errors?.passengers?.[index]?.dob?.message}
                          >
                            <Controller
                              name={`passengers.${index}.dob`}
                              control={control}
                              render={({ field }) => (
                                <DatePicker
                                  size={"large"}
                                  id={`dob[${index}]`}
                                  format="YYYY-MM-DD"
                                  locale={
                                    language === "uk"
                                      ? ukUA.DatePicker
                                      : enUS.DatePicker
                                  }
                                  onChange={(date) => {
                                    field.onChange(date);
                                  }}
                                />
                              )}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </Card>
                </>
              ))}
              <Card className={"customer-form"}>
                <Card.Title>{t("customerDetails")}</Card.Title>
                <Form layout={"vertical"}>
                  <Row>
                    <Col>
                      <Form.Item
                        label={t("email")}
                        validateStatus={errors.email ? "error" : "success"}
                        help={errors?.email?.message}
                      >
                        <Controller
                          name={"email"}
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Input
                              size={"large"}
                              id={"email"}
                              type="text"
                              {...field}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        label={t("phoneNumber")}
                        validateStatus={
                          errors.phoneNumber ? "error" : "success"
                        }
                        help={errors?.phoneNumber?.message}
                      >
                        <Controller
                          name={"phoneNumber"}
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Input
                              size={"large"}
                              id={"phoneNumber"}
                              type="text"
                              {...field}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

                <Button
                  disabled={isSubmitted && !isValid}
                  type={"primary"}
                  size={"large"}
                  htmlType={"submit"}
                >
                  {t("pay")}
                </Button>
              </Card>
            </form>
          )}

          {currentStep === 3 && (
            <Card className={"payment-card"}>{t("paymentSuccess")}</Card>
          )}
        </Col>
        <Col className={"sticky-card-container"}>
          <Card className={"sticky-card"}>
            <Card.Title>{t("aboutTrip")}</Card.Title>
            <Card.Body>
              <Steps
                progressDot
                className={"sticky-card-stepper"}
                direction="vertical"
                current={-1}
              >
                <Steps.Step
                  title={<Card.Title>{trip.startPoint}</Card.Title>}
                  description={
                    <Card.Text>
                      {trip.startPoint} - {trip.departureLocation}
                      {/*{formatDate(trip.departureDate, trip.departureTime)})*/}
                    </Card.Text>
                  }
                />
                <Steps.Step
                  title={<Card.Title>{trip.destination}</Card.Title>}
                  description={
                    <Card.Text>
                      {trip.destination} - {trip.arrivalLocation}
                      {/*{formatDate(trip.arrivalDate, trip.arrivalTime)})*/}
                    </Card.Text>
                  }
                />
              </Steps>

              <Card.Subtitle className={"mt-2 d-flex justify-content-between"}>
                <span>{t("price")} </span>
                <span>
                  {trip.price + ",00"} {t("uah")}
                </span>
              </Card.Subtitle>
              {passengersCount > 0 && (
                <Card.Title className={"mt-3 d-flex justify-content-between"}>
                  <span>{t("total")}</span>
                  <span>
                    {trip.price * passengersCount + ",00"} {t("uah")}
                  </span>
                </Card.Title>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Container>
      <Modal
        show={loading}
        onHide={() => {}}
        footer={null}
        closable={false}
        scrollable={false}
        centered
      >
        <div className="text-center m-5">
          <Spin size="large" />
          <p className={"mt-2"}>{t("processing")}</p>
        </div>
      </Modal>
      <Modal
        centered
        scrollable={false}
        show={errorMessage !== undefined && errorMessage !== ""}
        onHide={() => {}}
        footer={null}
        closable={false}
      >
        <Alert
          className={"p-5"}
          message={
            <>
              <Card.Subtitle>{t(errorMessage)} </Card.Subtitle>
              <Card.Text className={"m-0 mt-2"}>{t("contacts")}</Card.Text>
              <Card.Text>
                <a href={"https://t.me/UkrBus_ua"}>Telegram</a>
              </Card.Text>
            </>
          }
          type="error"
          showIcon
        />
      </Modal>
    </>
  );
};

export default PreorderPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locale = context.locale ?? "";
  const trips = await getData(locale as "en" | "uk");
  const trip = trips.trips.find((trip) => trip.id === context.params?.id);

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      trip,
    },
  };
};
