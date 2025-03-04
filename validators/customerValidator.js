const Joi = require("joi");

// Schema walidacji dla rejestracji klienta
const signupCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Imię jest wymagane.",
    "string.min": "Imię musi zawierać co najmniej 2 znaki.",
    "string.max": "Imię może zawierać maksymalnie 50 znaków.",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email jest wymagany.",
    "string.email": "Wprowadź poprawny adres email.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Hasło jest wymagane.",
    "string.min": "Hasło musi zawierać co najmniej 6 znaków.",
  }),
  passwordUnsecured: Joi.string().min(6).required().messages({
    "string.empty": "Hasło nieszyfrowane jest wymagane.",
    "string.min": "Hasło nieszyfrowane musi zawierać co najmniej 6 znaków.",
  }),
  organizationEmail: Joi.string().email().required().messages({
    "string.empty": "Email organizacji jest wymagany.",
    "string.email": "Wprowadź poprawny adres email organizacji.",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{9,15}$/)
    .allow("") // Pozwala na pusty ciąg znaków
    .optional() // Pole jest opcjonalne
    .messages({
      "string.pattern.base": "Numer telefonu musi zawierać od 9 do 15 cyfr.",
    }),
  // galleries: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional().allow("").max(500).messages({
    "string.max": "Notatki mogą zawierać maksymalnie 500 znaków.",
  }),
});

// Funkcja pomocnicza do walidacji
const validateRegisterCustomer = (data) => {
  return signupCustomerSchema.validate(data, { abortEarly: true }); // Zatrzymaj się na pierwszym błędzie
};

module.exports = {
  validateRegisterCustomer,
};
