/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Select from "react-select";

interface Teacher {
  name: string;
  email: string;
}

interface Contributor {
  name: string;
  email: string;
}

interface TeacherMap {
  name: string;
  email: string;
}

interface School {
  name: string;
}

interface TeacherOption {
  label: string;
  value: string;
  name: string;
}

const MultiSelectByName = ({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: Teacher[];
}) => {
  const [field, meta, helpers] = useField<Contributor[]>({ name });
  const selected = field.value || [];

  const toggle = (teacher: Teacher) => {
    const exists = selected.some((t) => t.email === teacher.email);
    if (exists) {
      helpers.setValue(selected.filter((t) => t.email !== teacher.email));
    } else {
      helpers.setValue([
        ...selected,
        { name: teacher.name, email: teacher.email },
      ]);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="border border-orange-500 rounded-md p-2 bg-white shadow-sm max-h-48 overflow-y-auto">
        {options.map((teacher) => {
          const selectedItem = selected.some((t) => t.email === teacher.email);
          return (
            <div
              key={teacher.email}
              onClick={() => toggle(teacher)}
              className={`cursor-pointer px-3 py-1 rounded-md ${
                selectedItem
                  ? "bg-orange-100 text-orange-600 font-semibold"
                  : "hover:bg-gray-100 text-black"
              }`}
            >
              {teacher.name}
            </div>
          );
        })}
      </div>
      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error as string}</div>
      )}
    </div>
  );
};

function CounselorAddTicket() {
  const email = localStorage.getItem("email");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isStudent, setIsStudent] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Fetch schools
  useEffect(() => {
    if (!email) return;
    setLoadingSchools(true);
    axios
      .get(`http://localhost:5000/counselorschools/${email}`)
      .then((res) => {
        const schoolList = (res.data.schools || [])
          .filter((s: any) => s.name)
          .map((s: any) => ({
            name: s.name,
          }));
        setSchools(schoolList);
      })
      .catch((err) => console.error("Error fetching schools:", err))
      .finally(() => setLoadingSchools(false));
  }, [email]);

  const fetchTeachers = async (schoolName: string) => {
    if (!email || !schoolName) return;
    setLoadingTeachers(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/counseloraddticketteachers/${schoolName}`,
        {
          params: { school: schoolName },
        }
      );
      const teacherList = (res.data.teachers || [])
        .filter((t: any) => t.Name && t.email)
        .map((t: any) => ({
          name: t.Name,
          email: t.email,
        }));
      setTeachers(teacherList);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const validationSchema = Yup.object({
    school: Yup.string().required("Please select a school"),
    ticketText: Yup.string()
      .required("Ticket description is required")
      .min(10, "Minimum 10 characters"),
    contributors: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().required(),
      })
    ),
    category: Yup.string().required("Please select a category"),
    selectedTeacher: isStudent
      ? Yup.object().optional()
      : Yup.object()
          .shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
          })
          .required("Please select a teacher"),
  });

  const handleSubmit = async (
    values: {
      school: string;
      ticketText: string;
      contributors: Contributor[];
      selectedTeacher: TeacherMap | null;
      category: string;
      privacy: boolean;
    },
    { resetForm, setSubmitting }: any
  ) => {
    console.log("Form Submitted With:", values);
    try {
      const payload: any = {
        school: values.school,
        ticketText: values.ticketText,
        contributors: values.contributors,
        category: values.category,
        privacy: values.privacy,
      };
      if (values.category === "Teacher" && values.selectedTeacher) {
        payload.teacher = {
          name: values.selectedTeacher.name,
          email: values.selectedTeacher.email,
        };
        console.log("Sending teacher data:", payload.teacher);
      }

      console.log("Final payload:", payload);

      await axios.post(
        `http://localhost:5000/counseloraddticket/${email}/${values.school}`,
        payload
      );

      alert("✅ Ticket submitted successfully!");
      resetForm();
      setTeachers([]);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("❌ Error submitting ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const schoolOptions = schools.map((s) => ({
    label: s.name,
    value: s.name,
  }));

  const teacherOptions: TeacherOption[] = teachers.map((t) => ({
    label: t.name,
    value: t.email,
    name: t.name,
  }));

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-semibold text-center mb-6 text-orange-600">
        Add Ticket
      </h1>
      <Formik
        initialValues={{
          school: "",
          ticketText: "",
          contributors: [] as Contributor[],
          selectedTeacher: null as TeacherMap | null,
          category: "",
          privacy: false,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, setFieldTouched, values }) => (
          <Form>
            {/* School Select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select School <span className="text-red-500">*</span>
              </label>
              <Select
                options={schoolOptions}
                placeholder="-- Select school --"
                isLoading={loadingSchools}
                onChange={(option: any) => {
                  setFieldValue("school", option?.value || "");
                  setFieldValue("selectedTeacher", null);
                  setFieldValue("contributors", []);
                  setTeachers([]);
                  if (option?.value) {
                    fetchTeachers(option.value);
                  }
                }}
                onBlur={() => setFieldTouched("school", true)}
                value={
                  values.school
                    ? { label: values.school, value: values.school }
                    : null
                }
                isClearable
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#f97316" : "#f97316",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#f97316",
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#6b7280",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#000000",
                  }),
                }}
              />
              <ErrorMessage
                name="school"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Ticket Text */}
            <Field
              as="textarea"
              name="ticketText"
              placeholder="Describe your issue here..."
              className="w-full h-32 p-4 text-sm rounded-lg border-2 border-orange-500 focus:outline-none text-black"
              disabled={!values.school}
            />
            <ErrorMessage
              name="ticketText"
              component="div"
              className="text-red-500 text-sm mt-1"
            />

            {/* Category Select */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                options={[
                  { label: "Student", value: "Student" },
                  { label: "Teacher", value: "Teacher" },
                  { label: "Early Adopter", value: "Early Adopter" },
                ]}
                placeholder="-- Select category --"
                isDisabled={!values.school}
                onChange={(option: any) => {
                  setFieldValue("category", option?.value);
                  setFieldValue("selectedTeacher", null);
                  setIsStudent(option?.value === "Student");
                }}
                onBlur={() => setFieldTouched("category", true)}
                value={
                  values.category
                    ? { label: values.category, value: values.category }
                    : null
                }
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#f97316" : "#f97316",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#f97316",
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#6b7280",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#000000",
                  }),
                }}
              />
              <ErrorMessage
                name="category"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Select Teacher - Only show for Teacher and Early Adopter categories */}
            {(values.category === "Teacher" ||
              values.category === "Early Adopter") && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Teacher
                </label>
                <Select<TeacherOption>
                  options={teacherOptions}
                  placeholder={
                    loadingTeachers
                      ? "Loading teachers..."
                      : "-- Select a teacher --"
                  }
                  isLoading={loadingTeachers}
                  isDisabled={!values.school || loadingTeachers}
                  onChange={(option) => {
                    if (option) {
                      setFieldValue("selectedTeacher", {
                        name: option.name,
                        email: option.value,
                      });
                    } else {
                      setFieldValue("selectedTeacher", null);
                    }
                  }}
                  onBlur={() => setFieldTouched("selectedTeacher", true)}
                  value={
                    values.selectedTeacher
                      ? {
                          label: values.selectedTeacher.name,
                          value: values.selectedTeacher.email,
                          name: values.selectedTeacher.name,
                        }
                      : null
                  }
                  isClearable
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#f97316" : "#f97316",
                      boxShadow: "none",
                      "&:hover": {
                        borderColor: "#f97316",
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#6b7280",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#000000",
                    }),
                  }}
                />
                <ErrorMessage
                  name="selectedTeacher"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}

            {/* Contributor Multiselect */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Contributors
              </label>
              <Select<TeacherOption, true>
                isMulti
                options={teacherOptions.filter(
                  (t) => t.value !== values.selectedTeacher?.email
                )}
                placeholder={
                  loadingTeachers
                    ? "Loading teachers..."
                    : "Search & select contributors"
                }
                isLoading={loadingTeachers}
                isDisabled={!values.school || loadingTeachers}
                onChange={(selectedOptions) => {
                  const contributors = (selectedOptions as TeacherOption[]).map(
                    (opt) => ({
                      name: opt.name || opt.label,
                      email: opt.value,
                    })
                  );
                  setFieldValue("contributors", contributors);
                }}
                onBlur={() => setFieldTouched("contributors", true)}
                value={teacherOptions.filter((opt) =>
                  values.contributors.some((c) => c.email === opt.value)
                )}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#f97316" : "#f97316",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#f97316",
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#fef3c7",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#c2410c",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#6b7280",
                  }),
                }}
              />

              <ErrorMessage
                name="contributors"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            {/* Private Ticket Checkbox */}
            {/* Privacy Checkbox */}
            <div className="flex items-center mt-4">
              <Field
                type="checkbox"
                name="privacy"
                id="privacy"
                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label
                htmlFor="privacy"
                className="ml-2 block text-sm text-gray-700"
              >
                Make this ticket private
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !values.school}
              className="mt-6 w-full bg-orange-500 text-white py-2 px-4 rounded-lg shadow hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default CounselorAddTicket;
