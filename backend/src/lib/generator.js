export const generateCredentials = ({ name, role, department }) => {
  // ---- validation ----
  if (!name || !role) {
    throw new Error("Name and role are required for credential generation");
  }

  // ---- local helper: clean string ----
  const cleanString = (value) => {
    return value.toLowerCase().replace(/\s+/g, "");
  };
  // ---- local helper: unique suffix ----
  const generateSuffix = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  const cleanedName = cleanString(name);
  const suffix = generateSuffix();

  let email;

  // ---- role-based email generation ----
  if (role === "DOCTOR") {
    if (!department) {
      throw new Error("Department is required for doctor email generation");
    }

    const cleanedDept = cleanString(department);
    email = `doctor.${cleanedName}.${cleanedDept}.${suffix}@hospital.com`;
  } else if (role === "NURSE") {
    email = `nurse.${cleanedName}.${suffix}@hospital.com`;
  } else {
    throw new Error("Unsupported role for credential generation");
  }

  // ---- password generation ----
  const password = `${cleanedName}@${suffix}`;
  

  return { email, password };
};
