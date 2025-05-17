import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function AddTicket() {
  const email = localStorage.getItem("email"); // Get email from localStorage

  // Yup validation schema
  const validationSchema = Yup.object({
    ticketText: Yup.string()
      .required("Ticket description is required")
      .min(10, "Ticket must be at least 10 characters long"),
  });

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/postTicket/raiseTicket/${email}`,
        {
          ticketText: values.ticketText,
        }
      );

      console.log("Ticket submitted:", response.data);
      alert("Ticket submitted successfully!");
      resetForm();
    } catch (error) {
      console.error(
        "Error submitting ticket:",
        error.response?.data || error.message
      );
      alert("Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-semibold text-center mb-6 text-orange-600">
        Add Ticket
      </h1>

      <Formik
        initialValues={{ ticketText: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Field
              as="textarea"
              name="ticketText"
              placeholder="Describe your issue here..."
              className={`w-full h-32 p-4 text-sm rounded-lg border-2 focus:outline-none ${
                touched.ticketText && errors.ticketText
                  ? "border-red-500 focus:ring-red-300"
                  : "border-orange-500 focus:ring-orange-300"
              }`}
            />
            <ErrorMessage
              name="ticketText"
              component="div"
              className="text-red-500 text-sm mt-1"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full bg-orange-500 text-white py-2 px-4 rounded-lg shadow hover:bg-orange-600 transition duration-200"
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AddTicket;
