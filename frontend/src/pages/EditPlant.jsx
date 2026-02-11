import { Col, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom"; // Import useParams
import DefaultLayout from "../components/DefaultLayout";
import Spinner from "../components/Spinner";
import { editBike, getAllBikes } from "../redux/actions/bikeAction";

function EditBike() {
  const { bikeid } = useParams(); // Use useParams to get bikeid from the route
  const { bikes } = useSelector((state) => state.bikeReducer);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.alertReducer);
  const [bike, setBike] = useState(null);

  useEffect(() => {
    if (bikes.length === 0) {
      dispatch(getAllBikes());
    } else {
      const foundBike = bikes.find((o) => o._id === bikeid);
      setBike(foundBike);
    }
  }, [bikes, bikeid,dispatch]);

  function onFinish(values) {
    if (bike) {
      values._id = bike._id;
      dispatch(editBike(values));
    }
  }

  return (
    <DefaultLayout>
      {loading && <Spinner />}
      <Row justify="center" className="mt-5">
        <Col lg={12} sm={24} xs={24} className="p-2">
          {bike && (
            <Form
              initialValues={bike}
              className="bs1 p-2"
              layout="vertical"
              onFinish={onFinish}
            >
              <h3>Edit Bike</h3>
              <hr />
              <Form.Item
                name="name"
                label="Bike Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="image"
                label="Image URL"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="rentPerHour"
                label="Rent Per Hour"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="capacity"
                label="Capacity"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="fuelType"
                label="Fuel Type"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <div className="text-right">
                <button className="btn1">Edit Bike</button>
              </div>
            </Form>
          )}
        </Col>
      </Row>
    </DefaultLayout>
  );
}

export default EditBike;
