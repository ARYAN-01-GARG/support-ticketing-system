type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "customer" | "agent";
};

type LoginRequest = {
  email: string;
  password: string;
};

export { RegisterRequest, LoginRequest };