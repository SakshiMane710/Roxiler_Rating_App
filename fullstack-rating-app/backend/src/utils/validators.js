const validateName = (name) => {
    if (!name || name.length < 20 || name.length > 60) {
        return "Name must be between 20 and 60 characters.";
    }
    return null;
};

const validateAddress = (address) => {
    if (!address || address.length > 400) {
        return "Address must be maximum 400 characters.";
    }
    return null;
};

const validatePassword = (password) => {
    if (!password || password.length < 8 || password.length > 16) {
        return "Password must be between 8 and 16 characters.";
    }
    const uppercaseRegex = /[A-Z]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    
    if (!uppercaseRegex.test(password)) {
        return "Password must include at least one uppercase letter.";
    }
    if (!specialCharRegex.test(password)) {
        return "Password must include at least one special character.";
    }
    return null;
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return "Please enter a valid email address.";
    }
    return null;
};

module.exports = {
    validateName,
    validateAddress,
    validatePassword,
    validateEmail
};
