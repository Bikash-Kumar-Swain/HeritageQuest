/* ==========================================================================
   GeoQuest Form Validators & Strength Calculator
   Pure client-side verification logic
   ========================================================================== */

export const Validator = {
  // Email or Player ID Validation
  validateEmailOrPlayerId(input) {
    if (!input || !input.trim()) {
      return { isValid: false, message: 'Email or Player ID is required.' };
    }
    const val = input.trim();
    if (val.includes('@')) {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(val)) {
        return { isValid: false, message: 'Please enter a valid email address.' };
      }
      return { isValid: true, message: '', type: 'email' };
    }
    if (val.length < 2) {
      return { isValid: false, message: 'Player ID must be at least 2 characters.' };
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(val)) {
      return { isValid: false, message: 'Player ID contains invalid characters.' };
    }
    return { isValid: true, message: '', type: 'playerId' };
  },

  // Email Validation
  validateEmail(email) {
    if (!email || !email.trim()) {
      return { isValid: false, message: 'Explorer email is required.' };
    }
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email.trim())) {
      return { isValid: false, message: 'Please enter a valid email address.' };
    }
    return { isValid: true, message: '' };
  },

  // Password Validation
  validatePassword(password, minLength = 6) {
    if (!password) {
      return { isValid: false, message: 'Password is required.' };
    }
    if (password.length < minLength) {
      return { isValid: false, message: `Password must be at least ${minLength} characters.` };
    }
    return { isValid: true, message: '' };
  },

  // Reserved usernames only. Real account uniqueness is enforced by Firebase Auth.
  takenUsernames: new Set(['explorer', 'geoquest', 'admin', 'shadow', 'legend', 'wayfarer', 'alexandria', 'petra']),

  // Username Validation
  validateUsername(username) {
    if (!username || !username.trim()) {
      return { isValid: false, message: 'Explorer username is required.' };
    }
    const cleanUser = username.trim().toLowerCase();
    if (cleanUser.length < 3) {
      return { isValid: false, message: 'Username must be at least 3 characters.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      return { isValid: false, message: 'Only letters, numbers, and underscores allowed.' };
    }
    if (this.takenUsernames.has(cleanUser)) {
      return { isValid: false, message: 'This explorer codename is already taken.' };
    }
    return { isValid: true, message: '' };
  },

  registerUsername(username) {
    if (username) {
      this.takenUsernames.add(username.trim().toLowerCase());
    }
  },

  // Confirm Password Match
  validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
      return { isValid: false, message: 'Please confirm your password.' };
    }
    if (password !== confirmPassword) {
      return { isValid: false, message: 'Passwords do not match.' };
    }
    return { isValid: true, message: '' };
  },

  // Calculate Password Strength (0 to 4)
  calculateStrength(password) {
    if (!password) {
      return { score: 0, label: 'None', textClass: '' };
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    const labels = [
      { score: 0, label: 'Very Weak', textClass: 'color: #e76f51;' },
      { score: 1, label: 'Weak', textClass: 'color: #e76f51;' },
      { score: 2, label: 'Fair', textClass: 'color: #f4a261;' },
      { score: 3, label: 'Good', textClass: 'color: #e9c46a;' },
      { score: 4, label: 'Strong', textClass: 'color: #52b788;' }
    ];

    return labels[score];
  }
};
