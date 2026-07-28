// KYC choice lists — value/label pairs mirror server/apps/accounts/choices.py
// exactly (the value is what the backend's CharField stores/expects).
export interface KYCOption {
  value: string;
  label: string;
}

export const GENDER_OPTIONS: KYCOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
];

export const RELATIONSHIP_STATUS_OPTIONS: KYCOption[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
  { value: "widowed", label: "Widowed" },
  { value: "others", label: "Others" },
];

export const EMPLOYMENT_STATUS_OPTIONS: KYCOption[] = [
  { value: "unemployed", label: "Unemployed" },
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "business", label: "Business" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
  { value: "others", label: "Others" },
];

export const YEARLY_INCOME_OPTIONS: KYCOption[] = [
  { value: "under_200k", label: "Less than ₦200,000" },
  { value: "200k_500k", label: "₦200,001 - ₦500,000" },
  { value: "500k_1m", label: "₦500,001 - ₦1 million" },
  { value: "1m_5m", label: "₦1 million - ₦5 million" },
  { value: "5m_10m", label: "₦5 million - ₦10 million" },
  { value: "10m_20m", label: "₦10 million - ₦20 million" },
  { value: "above_20m", label: "Above ₦20 million" },
];

export const IDENTIFICATION_TYPE_OPTIONS: KYCOption[] = [
  { value: "international_passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID Card (NIN)" },
  { value: "voters_card", label: "Permanent Voter's Card" },
  { value: "others", label: "Others" },
];

export const NEXT_OF_KIN_RELATIONSHIP_OPTIONS: KYCOption[] = [
  { value: "brother", label: "Brother" },
  { value: "sister", label: "Sister" },
  { value: "spouse", label: "Spouse" },
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "daughter", label: "Daughter" },
  { value: "son", label: "Son" },
  { value: "friend", label: "Friend" },
  { value: "relative", label: "Relative" },
  { value: "others", label: "Others" },
];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus",
  "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba",
  "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];
