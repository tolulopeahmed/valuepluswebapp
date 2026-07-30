// Nigerian bank directory — pulled from Paystack's own /bank list (the
// same provider ResolveBankAccountView resolves account names through),
// so every code here is guaranteed to actually resolve. `logo` is only
// filled in where a matching asset exists under public/images/banks/;
// leave it null rather than guessing a path that isn't there.
export interface BankOption {
  id: number;
  name: string;
  code: string;
  color: string;
  logo: string | null;
}

export const bankOptions: BankOption[] = [
  { id: 1, name: "5TT MFB", code: "51455", color: "#4C28BC", logo: null },
  { id: 2, name: "78 Finance Company Ltd", code: "40195", color: "#4C28BC", logo: null },
  { id: 3, name: "9jaPay Microfinance Bank", code: "090629", color: "#4C28BC", logo: null },
  { id: 4, name: "9mobile 9Payment Service Bank", code: "120001", color: "#4C28BC", logo: "/images/banks/9payment.png" },
  { id: 5, name: "Abbey Mortgage Bank", code: "404", color: "#4C28BC", logo: null },
  { id: 6, name: "Above Only MFB", code: "51204", color: "#4C28BC", logo: null },
  { id: 7, name: "Abulesoro MFB", code: "51312", color: "#4C28BC", logo: null },
  { id: 8, name: "Access Bank", code: "044", color: "#91A62A", logo: "/images/banks/access.png" },
  { id: 9, name: "Access Bank (Diamond)", code: "063", color: "#4C28BC", logo: null },
  { id: 10, name: "Accion Microfinance Bank", code: "602", color: "#4C28BC", logo: null },
  { id: 11, name: "Adamawa Mortgage Bank Limited", code: "90102", color: "#4C28BC", logo: null },
  { id: 12, name: "Advancly MFB", code: "090759", color: "#4C28BC", logo: null },
  { id: 13, name: "Aella MFB", code: "50315", color: "#4C28BC", logo: null },
  { id: 14, name: "AG Mortgage Bank", code: "90077", color: "#4C28BC", logo: null },
  { id: 15, name: "Ahmadu Bello University Microfinance Bank", code: "50036", color: "#4C28BC", logo: null },
  { id: 16, name: "Airtel Smartcash PSB", code: "120004", color: "#4C28BC", logo: "/images/banks/smartcash.webp" },
  { id: 17, name: "AKU Microfinance Bank", code: "51336", color: "#4C28BC", logo: null },
  { id: 18, name: "Akuchukwu Microfinance Bank Limited", code: "090561", color: "#4C28BC", logo: null },
  { id: 19, name: "Al-Barakah Microfinance Bank", code: "50055", color: "#4C28BC", logo: null },
  { id: 20, name: "ALAT by WEMA", code: "035A", color: "#4C28BC", logo: "/images/banks/alat.jpg" },
  { id: 21, name: "Alert MFB", code: "51074", color: "#4C28BC", logo: null },
  { id: 22, name: "ALLWORKERS MFB", code: "50059", color: "#4C28BC", logo: null },
  { id: 23, name: "Alpha Morgan Bank", code: "108", color: "#4C28BC", logo: null },
  { id: 24, name: "Alternative bank", code: "000304", color: "#4C28BC", logo: null },
  { id: 25, name: "Amju Unique MFB", code: "50926", color: "#4C28BC", logo: null },
  { id: 26, name: "Aramoko MFB", code: "50083", color: "#4C28BC", logo: null },
  { id: 27, name: "ASO Savings and Loans", code: "401", color: "#4C28BC", logo: null },
  { id: 28, name: "Assets Microfinance Bank", code: "50092", color: "#4C28BC", logo: null },
  { id: 29, name: "Astrapolaris MFB LTD", code: "MFB50094", color: "#4C28BC", logo: null },
  { id: 30, name: "AVUENEGBE MICROFINANCE BANK", code: "090478", color: "#4C28BC", logo: null },
  { id: 31, name: "AWACASH MICROFINANCE BANK", code: "51351", color: "#4C28BC", logo: null },
  { id: 32, name: "AZTEC MICROFINANCE BANK LIMITED", code: "51337", color: "#4C28BC", logo: null },
  { id: 33, name: "Bainescredit MFB", code: "51229", color: "#4C28BC", logo: null },
  { id: 34, name: "Banc Corp Microfinance Bank", code: "50117", color: "#4C28BC", logo: null },
  { id: 35, name: "Bank78 Microfinance Bank", code: "11072", color: "#4C28BC", logo: null },
  { id: 36, name: "BANKIT MFB", code: "50572", color: "#4C28BC", logo: null },
  { id: 37, name: "BANKIT MICROFINANCE BANK LTD", code: "50572", color: "#4C28BC", logo: null },
  { id: 38, name: "BANKLY MFB", code: "51341", color: "#4C28BC", logo: null },
  { id: 39, name: "Baobab Microfinance Bank", code: "MFB50992", color: "#4C28BC", logo: null },
  { id: 40, name: "BellBank Microfinance Bank", code: "51100", color: "#4C28BC", logo: null },
  { id: 41, name: "Benysta Microfinance Bank Limited", code: "51267", color: "#4C28BC", logo: null },
  { id: 42, name: "Berachah Microfinance Bank Ltd.", code: "50122", color: "#4C28BC", logo: null },
  { id: 43, name: "Beststar Microfinance Bank", code: "50123", color: "#4C28BC", logo: null },
  { id: 44, name: "BOLD MFB", code: "50725", color: "#4C28BC", logo: null },
  { id: 45, name: "Boost Microfinance Bank", code: "51449", color: "#4C28BC", logo: null },
  { id: 46, name: "Bosak Microfinance Bank", code: "650", color: "#4C28BC", logo: null },
  { id: 47, name: "Bowen Microfinance Bank", code: "50931", color: "#4C28BC", logo: null },
  { id: 48, name: "Branch International Finance Company Limited", code: "FC40163", color: "#4C28BC", logo: null },
  { id: 49, name: "Brent Mortgage bank", code: "90070", color: "#4C28BC", logo: null },
  { id: 50, name: "BuyPower MFB", code: "50645", color: "#4C28BC", logo: null },
  { id: 51, name: "Carbon", code: "565", color: "#4C28BC", logo: "/images/banks/carbon.png" },
  { id: 52, name: "Cashbridge Microfinance Bank Limited", code: "51353", color: "#4C28BC", logo: null },
  { id: 53, name: "CASHCONNECT MFB", code: "865", color: "#4C28BC", logo: null },
  { id: 54, name: "Cedrus MFB", code: "51437", color: "#4C28BC", logo: null },
  { id: 55, name: "CEMCS Microfinance Bank", code: "50823", color: "#4C28BC", logo: null },
  { id: 56, name: "Centrum Finance", code: "050032", color: "#4C28BC", logo: null },
  { id: 57, name: "Chanelle Microfinance Bank Limited", code: "50171", color: "#4C28BC", logo: null },
  { id: 58, name: "Chikum Microfinance bank", code: "312", color: "#4C28BC", logo: null },
  { id: 59, name: "Citibank Nigeria", code: "023", color: "#0275D0", logo: "/images/banks/citi.webp" },
  { id: 60, name: "CITYCODE MORTAGE BANK", code: "070027", color: "#4C28BC", logo: null },
  { id: 61, name: "Consumer Microfinance Bank", code: "50910", color: "#4C28BC", logo: null },
  { id: 62, name: "Cool Microfinance Bank Limited", code: "51458", color: "#4C28BC", logo: null },
  { id: 63, name: "Cooperative Mortgage Bank", code: "90089", color: "#4C28BC", logo: null },
  { id: 64, name: "Corestep MFB", code: "50204", color: "#4C28BC", logo: null },
  { id: 65, name: "Coronation Merchant Bank", code: "559", color: "#4C28BC", logo: null },
  { id: 66, name: "County Finance Limited", code: "FC40128", color: "#4C28BC", logo: null },
  { id: 67, name: "Credit Direct Limited", code: "40119", color: "#4C28BC", logo: null },
  { id: 68, name: "Crescent MFB", code: "51297", color: "#4C28BC", logo: null },
  { id: 69, name: "Crust Microfinance Bank", code: "090560", color: "#4C28BC", logo: null },
  { id: 70, name: "CRUTECH MICROFINANCE BANK LTD", code: "50216", color: "#4C28BC", logo: null },
  { id: 71, name: "Dash Microfinance Bank", code: "51368", color: "#4C28BC", logo: null },
  { id: 72, name: "Davenport MICROFINANCE BANK", code: "51334", color: "#4C28BC", logo: null },
  { id: 73, name: "Dillon Microfinance Bank", code: "51450", color: "#4C28BC", logo: null },
  { id: 74, name: "Dot Microfinance Bank", code: "50162", color: "#4C28BC", logo: null },
  { id: 75, name: "EBSU Microfinance Bank", code: "50922", color: "#4C28BC", logo: null },
  { id: 76, name: "Ecobank Nigeria", code: "050", color: "#00537F", logo: "/images/banks/ecobank.webp" },
  { id: 77, name: "Ekimogun MFB", code: "50263", color: "#4C28BC", logo: null },
  { id: 78, name: "Ekondo Microfinance Bank", code: "098", color: "#4C28BC", logo: null },
  { id: 79, name: "ESO-E MICROFINANCE BANK LIMITED", code: "50280", color: "#4C28BC", logo: null },
  { id: 80, name: "Ethica MFB", code: "51475", color: "#4C28BC", logo: null },
  { id: 81, name: "EXCEL FINANCE BANK", code: "090678", color: "#4C28BC", logo: null },
  { id: 82, name: "Eyowo", code: "50126", color: "#4C28BC", logo: null },
  { id: 83, name: "Fairmoney Microfinance Bank", code: "51318", color: "#4C28BC", logo: null },
  { id: 84, name: "FCMB MFB", code: "51241", color: "#4C28BC", logo: null },
  { id: 85, name: "Fedeth MFB", code: "50298", color: "#4C28BC", logo: null },
  { id: 86, name: "Fewchore Finance Company Limited", code: "050002", color: "#4C28BC", logo: null },
  { id: 87, name: "FFS Microfinance Bank", code: "51110", color: "#4C28BC", logo: null },
  { id: 88, name: "Fidelity Bank", code: "070", color: "#232B69", logo: "/images/banks/fidelity.png" },
  { id: 89, name: "Firmus MFB", code: "51314", color: "#4C28BC", logo: null },
  { id: 90, name: "First Bank of Nigeria", code: "011", color: "#0C2B5C", logo: "/images/banks/firstbank.jpg" },
  { id: 91, name: "First City Monument Bank", code: "214", color: "#702699", logo: "/images/banks/fcmb.png" },
  { id: 92, name: "First Option MFB", code: "50934", color: "#4C28BC", logo: null },
  { id: 93, name: "FIRST ROYAL MICROFINANCE BANK", code: "090164", color: "#4C28BC", logo: null },
  { id: 94, name: "FIRSTMIDAS MFB", code: "51333", color: "#4C28BC", logo: null },
  { id: 95, name: "FirstTrust Mortgage Bank Nigeria", code: "413", color: "#4C28BC", logo: null },
  { id: 96, name: "Flutterwave MFB", code: "090567", color: "#4C28BC", logo: null },
  { id: 97, name: "Fortress MFB", code: "D53", color: "#4C28BC", logo: null },
  { id: 98, name: "FSDH Merchant Bank Limited", code: "501", color: "#4C28BC", logo: null },
  { id: 99, name: "FUTMINNA MICROFINANCE BANK", code: "832", color: "#4C28BC", logo: null },
  { id: 100, name: "Garun Mallam MFB", code: "MFB51093", color: "#4C28BC", logo: null },
  { id: 101, name: "Gateway Mortgage Bank LTD", code: "812", color: "#4C28BC", logo: null },
  { id: 102, name: "Globus Bank", code: "00103", color: "#4C28BC", logo: null },
  { id: 103, name: "Goldman MFB", code: "090574", color: "#4C28BC", logo: null },
  { id: 104, name: "GoMoney", code: "100022", color: "#4C28BC", logo: null },
  { id: 105, name: "GOOD SHEPHERD MICROFINANCE BANK", code: "090664", color: "#4C28BC", logo: null },
  { id: 106, name: "Goodnews Microfinance Bank", code: "50739", color: "#4C28BC", logo: null },
  { id: 107, name: "Greenwich Merchant Bank", code: "562", color: "#4C28BC", logo: null },
  { id: 108, name: "GROOMING MICROFINANCE BANK", code: "51276", color: "#4C28BC", logo: null },
  { id: 109, name: "GTI MFB", code: "50368", color: "#4C28BC", logo: null },
  { id: 110, name: "Guaranty Trust Bank", code: "058", color: "#C3460E", logo: "/images/banks/gtb.png" },
  { id: 111, name: "Hackman Microfinance Bank", code: "51251", color: "#4C28BC", logo: null },
  { id: 112, name: "Haggai Mortgage Bank", code: "90065", color: "#4C28BC", logo: null },
  { id: 113, name: "Hasal Microfinance Bank", code: "50383", color: "#4C28BC", logo: null },
  { id: 114, name: "Hayat Trust MFB", code: "51364", color: "#4C28BC", logo: null },
  { id: 115, name: "HopePSB", code: "120002", color: "#4C28BC", logo: null },
  { id: 116, name: "IBANK Microfinance Bank", code: "51211", color: "#4C28BC", logo: null },
  { id: 117, name: "IBBU MFB", code: "51279", color: "#4C28BC", logo: null },
  { id: 118, name: "Ibile Microfinance Bank", code: "51244", color: "#4C28BC", logo: null },
  { id: 119, name: "Ibom Mortgage Bank", code: "90012", color: "#4C28BC", logo: null },
  { id: 120, name: "Ikoyi Osun MFB", code: "50439", color: "#4C28BC", logo: null },
  { id: 121, name: "Ilaro Poly Microfinance Bank", code: "50442", color: "#4C28BC", logo: null },
  { id: 122, name: "Imowo MFB", code: "50453", color: "#4C28BC", logo: null },
  { id: 123, name: "IMPERIAL HOMES MORTAGE BANK", code: "415", color: "#4C28BC", logo: null },
  { id: 124, name: "INEBA GOGO MFB", code: "51462", color: "#4C28BC", logo: null },
  { id: 125, name: "Infinity MFB", code: "50457", color: "#4C28BC", logo: null },
  { id: 126, name: "Infinity trust  Mortgage Bank", code: "070016", color: "#4C28BC", logo: null },
  { id: 127, name: "ISUA MFB", code: "090701", color: "#4C28BC", logo: null },
  { id: 128, name: "Jaiz Bank", code: "301", color: "#0B411F", logo: "/images/banks/jaiz.jpg" },
  { id: 129, name: "Jubilee Life Mortgage Bank", code: "402", color: "#4C28BC", logo: null },
  { id: 130, name: "Kadpoly MFB", code: "50502", color: "#4C28BC", logo: null },
  { id: 131, name: "KANOPOLY MFB", code: "51308", color: "#4C28BC", logo: null },
  { id: 132, name: "Kayvee Microfinance Bank", code: "5129", color: "#4C28BC", logo: null },
  { id: 133, name: "Kebbi Homes Savings and Loans Limited", code: "90028", color: "#4C28BC", logo: null },
  { id: 134, name: "Keystone Bank", code: "082", color: "#014888", logo: "/images/banks/keystone.jpeg" },
  { id: 135, name: "Kolomoni MFB", code: "899", color: "#4C28BC", logo: null },
  { id: 136, name: "KONGAPAY (Kongapay Technologies Limited)(formerly Zinternet)", code: "100025", color: "#4C28BC", logo: null },
  { id: 137, name: "Kredi Money MFB LTD", code: "50200", color: "#4C28BC", logo: null },
  { id: 138, name: "Kuda Bank", code: "50211", color: "#4C28BC", logo: "/images/banks/kuda.jpeg" },
  { id: 139, name: "Lagos Building Investment Company Plc.", code: "90052", color: "#4C28BC", logo: null },
  { id: 140, name: "Lemmy MFB", code: "091003", color: "#4C28BC", logo: null },
  { id: 141, name: "Letshego Microfinance Bank", code: "090420", color: "#4C28BC", logo: null },
  { id: 142, name: "Links MFB", code: "50549", color: "#4C28BC", logo: null },
  { id: 143, name: "Living Trust Mortgage Bank", code: "031", color: "#4C28BC", logo: null },
  { id: 144, name: "LOMA MFB", code: "50491", color: "#4C28BC", logo: null },
  { id: 145, name: "Lotus Bank", code: "303", color: "#4C28BC", logo: null },
  { id: 146, name: "Maal MFB", code: "51444", color: "#4C28BC", logo: null },
  { id: 147, name: "MAINSTREET MICROFINANCE BANK", code: "090171", color: "#4C28BC", logo: null },
  { id: 148, name: "Mayfair MFB", code: "50563", color: "#4C28BC", logo: null },
  { id: 149, name: "Mayfresh Mortgage Bank", code: "90003", color: "#4C28BC", logo: null },
  { id: 150, name: "Mega Microfinance Bank", code: "50570", color: "#4C28BC", logo: null },
  { id: 151, name: "Michael Okpara UniAgric Microfinance Bank", code: "MFB51116M", color: "#4C28BC", logo: null },
  { id: 152, name: "Mint MFB", code: "50304", color: "#4C28BC", logo: null },
  { id: 153, name: "MINT-FINEX MFB", code: "09", color: "#4C28BC", logo: null },
  { id: 154, name: "Money Master PSB", code: "946", color: "#4C28BC", logo: null },
  { id: 155, name: "Moniepoint MFB", code: "50515", color: "#0649C4", logo: "/images/banks/moniepoint.jpeg" },
  { id: 156, name: "MTN Momo PSB", code: "120003", color: "#4C28BC", logo: "/images/banks/momo.png" },
  { id: 157, name: "MUTUAL BENEFITS MICROFINANCE BANK", code: "090190", color: "#4C28BC", logo: null },
  { id: 158, name: "NDCC MICROFINANCE BANK", code: "090679", color: "#4C28BC", logo: null },
  { id: 159, name: "NET MICROFINANCE BANK", code: "51361", color: "#4C28BC", logo: null },
  { id: 160, name: "Nigerian Navy Microfinance Bank Limited", code: "51142", color: "#4C28BC", logo: null },
  { id: 161, name: "NIRSAL MICROFINANCE", code: "51304", color: "#4C28BC", logo: null },
  { id: 162, name: "Nombank MFB", code: "50072", color: "#4C28BC", logo: null },
  { id: 163, name: "NOVA BANK", code: "561", color: "#4C28BC", logo: null },
  { id: 164, name: "Novus MFB", code: "51371", color: "#4C28BC", logo: null },
  { id: 165, name: "NPF MICROFINANCE BANK", code: "50629", color: "#4C28BC", logo: null },
  { id: 166, name: "NSUK MICROFINANACE BANK", code: "51261", color: "#4C28BC", logo: null },
  { id: 167, name: "NUVION MFB", code: "51392", color: "#4C28BC", logo: null },
  { id: 168, name: "Olabisi Onabanjo University Microfinance Bank", code: "50689", color: "#4C28BC", logo: null },
  { id: 169, name: "OLUCHUKWU MICROFINANCE BANK LTD", code: "50697", color: "#4C28BC", logo: null },
  { id: 170, name: "Opay", code: "999992", color: "#08A67C", logo: "/images/banks/opay.jpeg" },
  { id: 171, name: "Optimus Bank Limited", code: "107", color: "#4C28BC", logo: "/images/banks/Optimus.jpeg" },
  { id: 172, name: "Pact Microfinance Bank", code: "51477", color: "#4C28BC", logo: null },
  { id: 173, name: "Paga", code: "100002", color: "#4C28BC", logo: "/images/banks/paga.jpg" },
  { id: 174, name: "PalmPay", code: "999991", color: "#7F13CB", logo: "/images/banks/palmpay.png" },
  { id: 175, name: "Parallex Bank", code: "104", color: "#4C28BC", logo: "/images/banks/parallex.png" },
  { id: 176, name: "Parkway - ReadyCash", code: "311", color: "#4C28BC", logo: null },
  { id: 177, name: "PATHFINDER MICROFINANCE BANK LIMITED", code: "090680", color: "#4C28BC", logo: null },
  { id: 178, name: "Paystack MFB", code: "51457", color: "#4C28BC", logo: null },
  { id: 179, name: "Paystack-Titan", code: "100039", color: "#4C28BC", logo: null },
  { id: 180, name: "Peace Microfinance Bank", code: "50743", color: "#4C28BC", logo: null },
  { id: 181, name: "PECANTRUST MICROFINANCE BANK LIMITED", code: "51226", color: "#4C28BC", logo: null },
  { id: 182, name: "Personal Trust MFB", code: "51146", color: "#4C28BC", logo: null },
  { id: 183, name: "Petra Mircofinance Bank Plc", code: "50746", color: "#4C28BC", logo: null },
  { id: 184, name: "Pettysave MFB", code: "MFB51452", color: "#4C28BC", logo: null },
  { id: 185, name: "PFI FINANCE COMPANY LIMITED", code: "050021", color: "#4C28BC", logo: null },
  { id: 186, name: "Platinum Mortgage Bank", code: "268", color: "#4C28BC", logo: null },
  { id: 187, name: "Pocket App", code: "00716", color: "#4C28BC", logo: null },
  { id: 188, name: "Polaris Bank", code: "076", color: "#8834AE", logo: "/images/banks/polaris.png" },
  { id: 189, name: "Polyunwana MFB", code: "50864", color: "#4C28BC", logo: null },
  { id: 190, name: "PremiumTrust Bank", code: "105", color: "#4C28BC", logo: "/images/banks/premiumtrust.jpg" },
  { id: 191, name: "Prospa Capital Microfinance Bank", code: "50739", color: "#4C28BC", logo: null },
  { id: 192, name: "PROSPERIS FINANCE LIMITED", code: "050023", color: "#4C28BC", logo: null },
  { id: 193, name: "Providus Bank", code: "101", color: "#4C28BC", logo: "/images/banks/providus.png" },
  { id: 194, name: "QuickFund MFB", code: "51293", color: "#4C28BC", logo: null },
  { id: 195, name: "Rand Merchant Bank", code: "502", color: "#4C28BC", logo: null },
  { id: 196, name: "RANDALPHA MICROFINANCE BANK", code: "090496", color: "#4C28BC", logo: null },
  { id: 197, name: "Rank MFB", code: "50130", color: "#4C28BC", logo: null },
  { id: 198, name: "Refuge Mortgage Bank", code: "90067", color: "#4C28BC", logo: null },
  { id: 199, name: "REHOBOTH MICROFINANCE BANK", code: "50761", color: "#4C28BC", logo: null },
  { id: 200, name: "Rephidim Microfinance Bank", code: "50994", color: "#4C28BC", logo: null },
  { id: 201, name: "Retrust Mfb", code: "51375", color: "#4C28BC", logo: null },
  { id: 202, name: "Rex Microfinance Bank", code: "51108", color: "#4C28BC", logo: null },
  { id: 203, name: "Rigo Microfinance Bank Limited", code: "51286", color: "#4C28BC", logo: null },
  { id: 204, name: "ROCKSHIELD MICROFINANCE BANK", code: "50767", color: "#4C28BC", logo: null },
  { id: 205, name: "Rubies MFB", code: "125", color: "#4C28BC", logo: "/images/banks/rubies.png" },
  { id: 206, name: "Safe Haven MFB", code: "51113", color: "#4C28BC", logo: null },
  { id: 207, name: "SAGE GREY FINANCE LIMITED", code: "40165", color: "#4C28BC", logo: null },
  { id: 208, name: "Shield MFB", code: "50582", color: "#4C28BC", logo: null },
  { id: 209, name: "Signature Bank Ltd", code: "106", color: "#4C28BC", logo: null },
  { id: 210, name: "Solid Allianze MFB", code: "51062", color: "#4C28BC", logo: null },
  { id: 211, name: "Solid Rock MFB", code: "50800", color: "#4C28BC", logo: null },
  { id: 212, name: "Sparkle Microfinance Bank", code: "51310", color: "#4C28BC", logo: null },
  { id: 213, name: "SPECTRUM MFB LTD", code: "50756", color: "#4C28BC", logo: null },
  { id: 214, name: "Springfield Microfinance Bank", code: "51429", color: "#4C28BC", logo: null },
  { id: 215, name: "Stanbic IBTC Bank", code: "221", color: "#04009D", logo: "/images/banks/stanbic.jpeg" },
  { id: 216, name: "Standard Chartered Bank", code: "068", color: "#0671A9", logo: "/images/banks/schartered.png" },
  { id: 217, name: "STANFORD MICROFINANCE BANK", code: "090162", color: "#4C28BC", logo: null },
  { id: 218, name: "STATESIDE MICROFINANCE BANK", code: "50809", color: "#4C28BC", logo: null },
  { id: 219, name: "STB Mortgage Bank", code: "070022", color: "#4C28BC", logo: null },
  { id: 220, name: "Stellas MFB", code: "51253", color: "#4C28BC", logo: null },
  { id: 221, name: "Sterling Bank", code: "232", color: "#DB3539", logo: "/images/banks/sterling.jpeg" },
  { id: 222, name: "Summit Bank", code: "00305", color: "#4C28BC", logo: null },
  { id: 223, name: "Suntrust Bank", code: "100", color: "#4C28BC", logo: "/images/banks/suntrust.png" },
  { id: 224, name: "Supreme MFB", code: "50968", color: "#4C28BC", logo: null },
  { id: 225, name: "Sycamore Microfinance Bank", code: "51056", color: "#4C28BC", logo: null },
  { id: 226, name: "TAJ Bank", code: "302", color: "#4C28BC", logo: null },
  { id: 227, name: "Tangerine Money", code: "51269", color: "#4C28BC", logo: null },
  { id: 228, name: "Tatum Bank", code: "109", color: "#4C28BC", logo: null },
  { id: 229, name: "TENN", code: "51403", color: "#4C28BC", logo: null },
  { id: 230, name: "Think Finance Microfinance Bank", code: "677", color: "#4C28BC", logo: null },
  { id: 231, name: "Titan Bank", code: "102", color: "#4C28BC", logo: "/images/banks/titan.png" },
  { id: 232, name: "TransPay MFB", code: "090708", color: "#4C28BC", logo: null },
  { id: 233, name: "TRUSTBANC J6 MICROFINANCE BANK", code: "51118", color: "#4C28BC", logo: null },
  { id: 234, name: "U and C MFB", code: "50840", color: "#4C28BC", logo: null },
  { id: 235, name: "U&C Microfinance Bank Ltd (U AND C MFB)", code: "50840", color: "#4C28BC", logo: null },
  { id: 236, name: "UBJ Microfinance Bank Limited", code: "51396", color: "#4C28BC", logo: null },
  { id: 237, name: "UCEE MFB", code: "090706", color: "#4C28BC", logo: null },
  { id: 238, name: "Uhuru MFB", code: "51322", color: "#4C28BC", logo: null },
  { id: 239, name: "Ultraviolet Microfinance Bank", code: "51080", color: "#4C28BC", logo: null },
  { id: 240, name: "Unaab Microfinance Bank Limited", code: "50870", color: "#4C28BC", logo: null },
  { id: 241, name: "UNIABUJA MFB", code: "51447", color: "#4C28BC", logo: null },
  { id: 242, name: "Unical MFB", code: "50871", color: "#4C28BC", logo: null },
  { id: 243, name: "Unilag Microfinance Bank", code: "51316", color: "#4C28BC", logo: null },
  { id: 244, name: "UNIMAID MICROFINANCE BANK", code: "50875", color: "#4C28BC", logo: null },
  { id: 245, name: "Union Bank of Nigeria", code: "032", color: "#00ADEF", logo: "/images/banks/union.png" },
  { id: 246, name: "United Bank For Africa", code: "033", color: "#D42C07", logo: "/images/banks/uba.png" },
  { id: 247, name: "Unity Bank", code: "215", color: "#88BB52", logo: "/images/banks/unity.png" },
  { id: 248, name: "UNIUYO Microfinance Bank Ltd", code: "50880", color: "#4C28BC", logo: null },
  { id: 249, name: "Uzondu Microfinance Bank Awka Anambra State", code: "50894", color: "#4C28BC", logo: null },
  { id: 250, name: "Vale Finance Limited", code: "050020", color: "#4C28BC", logo: null },
  { id: 251, name: "VFD Microfinance Bank Limited", code: "566", color: "#4C28BC", logo: "/images/banks/vfd.jpeg" },
  { id: 252, name: "Victory MFB", code: "51085", color: "#4C28BC", logo: null },
  { id: 253, name: "Waya Microfinance Bank", code: "51355", color: "#4C28BC", logo: null },
  { id: 254, name: "Wema Bank", code: "035", color: "#72235A", logo: "/images/banks/wema.png" },
  { id: 255, name: "Weston Charis MFB", code: "51386", color: "#4C28BC", logo: null },
  { id: 256, name: "Whitecrust Finance Company", code: "402001", color: "#4C28BC", logo: null },
  { id: 257, name: "Xpress Wallet", code: "100040", color: "#4C28BC", logo: null },
  { id: 258, name: "YCT MFB", code: "51253", color: "#4C28BC", logo: null },
  { id: 259, name: "Yes MFB", code: "594", color: "#4C28BC", logo: null },
  { id: 260, name: "Zap", code: "00zap", color: "#4C28BC", logo: null },
  { id: 261, name: "Zenith Bank", code: "057", color: "#E6000D", logo: "/images/banks/zenith.png" },
  { id: 262, name: "Zitra MFB", code: "51373", color: "#4C28BC", logo: null },
];

// Bank code is the stable identifier — a stored account's `bankName` is
// a snapshot from whenever it was added, so if the canonical name in
// this list is ever renamed later (e.g. Opay's Paystack name used to be
// "OPay Digital Services Limited (OPay)"), older accounts would
// otherwise keep showing the stale name/no logo forever. Code lookup
// is tried first and wins when available. Name-matching is the fallback
// for accounts added before bankCode existed — exact match first, then
// a substring check either direction, since a legacy stored name may be
// a longer/older variant of today's shorter canonical one (or vice
// versa) rather than identical text.
function findBankOption(bankName: string, bankCode?: string): BankOption | undefined {
  if (bankCode) {
    const byCode = bankOptions.find((b) => b.code === bankCode);
    if (byCode) return byCode;
  }

  const normalized = bankName.toLowerCase().trim();
  const exact = bankOptions.find((b) => b.name.toLowerCase() === normalized);
  if (exact) return exact;

  return bankOptions.find((b) => {
    const candidate = b.name.toLowerCase();
    return normalized.includes(candidate) || candidate.includes(normalized);
  });
}

export function getBankLogo(bankName: string, bankCode?: string): string | null {
  return findBankOption(bankName, bankCode)?.logo ?? null;
}

export function getCanonicalBankName(bankName: string, bankCode?: string): string {
  return findBankOption(bankName, bankCode)?.name ?? bankName;
}

// The everyday-Nigerian short form of a bank's name, keyed by Paystack's
// bank code (the same stable identifier findBankOption prefers) — for
// tight spaces like Settings' status chip, where "Guaranty Trust Bank"
// wraps/truncates but "GTBank" fits on one line. Only the banks common
// enough that a shortened form is actually recognizable get an entry;
// anything else falls back to its full canonical name unchanged.
const SHORT_BANK_NAME_BY_CODE: Record<string, string> = {
  "044": "Access",
  "063": "Access (Diamond)",
  "011": "FirstBank",
  "214": "FCMB",
  "058": "GTBank",
  "057": "Zenith",
  "033": "UBA",
  "032": "Union Bank",
  "221": "Stanbic IBTC",
  "232": "Sterling",
  "035": "Wema",
  "035A": "ALAT",
  "076": "Polaris",
  "082": "Keystone",
  "070": "Fidelity",
  "050": "Ecobank",
  "101": "Providus",
  "50211": "Kuda",
  "999991": "PalmPay",
  "999992": "Opay",
  "50515": "Moniepoint",
  "565": "Carbon",
  "100002": "Paga",
  "068": "StanChart",
  "023": "Citibank",
  "301": "Jaiz",
  "215": "Unity",
  "102": "Titan",
  "566": "VFD",
  "125": "Rubies",
  "104": "Parallex",
  "107": "Optimus",
  "105": "PremiumTrust",
  "100": "Suntrust",
  "120003": "MoMo PSB",
  "120004": "Smartcash",
  "120001": "9PSB",
  "120002": "Hope PSB",
};

export function getShortBankName(bankName: string, bankCode?: string): string {
  const option = findBankOption(bankName, bankCode);
  if (option && SHORT_BANK_NAME_BY_CODE[option.code]) {
    return SHORT_BANK_NAME_BY_CODE[option.code];
  }
  return option?.name ?? bankName;
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgbTuple(hex);
  const mix = (channel: number) => Math.round(channel * (1 - amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// Each bank card takes on that bank's own brand color (bankOptions[].color)
// instead of one fixed navy for every card — fades to near-black so white
// text stays readable regardless of how bright the brand color itself is.
// `muted` is for a non-selected/non-default card that should still hint
// at the bank's color without competing with whichever one IS active.
export function getBankCardGradient(
  bankName: string,
  bankCode?: string,
  muted = false,
): string {
  const color = findBankOption(bankName, bankCode)?.color ?? "#2b3568";
  const start = muted ? darken(color, 0.75) : color;
  const mid = darken(color, muted ? 0.85 : 0.6);
  const end = darken(color, 0.94);
  return `linear-gradient(155deg, ${start} 0%, ${mid} 55%, ${end} 100%)`;
}

// The account users pay into — shown in the transaction details modal so
// they know exactly where to send a bank transfer. Admin confirms the
// payment manually once it lands; the app has no live payment gateway.
export const VALUEPLUS_PAYMENT_ACCOUNT = {
  accountName: "VALUEPLUS MEDIA LIMITED",
  accountNumber: "6360570091",
  bankName: "Moniepoint",
  logo: "/images/banks/moniepoint.jpeg",
};
