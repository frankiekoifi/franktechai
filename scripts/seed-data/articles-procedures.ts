/**
 * FrankTechSpace AI — Procedure articles
 * Each item is inserted as a knowledge document by scripts/seed-knowledge.ts
 *
 * Guidelines for editing:
 * - Keep every article focused on ONE service or task
 * - Always include: Requirements, Steps, Common problems
 * - Use plain Markdown: # ## ### headings, numbered lists, tables
 * - Prices in KES
 * - Contact: Francis 0700468158 · francisochieng700@gmail.com
 */

export type SeedArticle = {
  title: string;
  category: string;
  content: string;
};

export const PROCEDURE_ARTICLES: SeedArticle[] = [
  // ============================================================
  // KRA SERVICES
  // ============================================================
  {
    title: "KRA Services — PIN Registration, PIN Retrieval, Nil Returns, P9, TCC, PIN Update, Email Reset",
    category: "Government e-Services",
    content: `# KRA (Kenya Revenue Authority) Services — Complete Guide

FrankTechSpace assists with all KRA services. Customers may use either the **KRA iTax portal** (itax.kra.go.ke) directly OR the **eCitizen KRA section** (ecitizen.go.ke). Both work — the steps below show the direct iTax route first (recommended), with an eCitizen alternative.

## General requirements (all KRA services)
- Original National ID card (number and date of birth)
- An active email address the customer can access now (Gmail is fine)
- An active phone number registered in the customer's own name
- KRA PIN (for services that require it — not needed for new registration)

---

## 1. New KRA PIN Registration

**Price:** KES 200–300

**Requirements:**
- Original ID
- Active email address
- Active phone number
- Physical address details (county, town, street)

**Steps (via KRA iTax portal — recommended):**
1. Open https://itax.kra.go.ke
2. Click **New PIN Registration**
3. Select **Taxpayer Type: Individual** → **Mode of Registration: Online Form** → click Next
4. Enter ID number and date of birth. The system auto-fills names from IPRS
5. Enter email address and phone number
6. Enter address details (county, town, street)
7. Under Obligation Details, select **Income Tax – Resident Individual** (typical for individuals)
8. Solve the arithmetic security question
9. Submit. The PIN certificate is emailed to the customer
10. Download, print, and give the customer the PIN certificate

**Steps (via eCitizen KRA section — alternative):**
1. Open https://www.ecitizen.go.ke and log in
2. Go to **Ministries & Departments → Kenya Revenue Authority**
3. Select **PIN Registration** and follow the prompts (same information as above)

**Common problems:**
- Details don't match IPRS: the customer must visit a KRA office or Huduma Centre to verify their ID
- Email not receiving the PIN certificate: check spam folder; if still missing, use KRA's "Resend PIN" option

---

## 2. KRA PIN Retrieval (customer forgot their PIN)

**Price:** included with related service, ask at the counter

**Steps:**
1. Open https://itax.kra.go.ke
2. Click **PIN Checker** (or **Forgot PIN**)
3. Enter ID number and the registered email
4. The PIN is sent to the registered email or displayed
5. If the customer no longer has access to the registered email, they must apply to change it (see Email Reset below) or visit a KRA office

---

## 3. Nil Returns Filing

**Price:** KES 150

**When to file Nil Returns:** only when the customer had NO income in the year (no employment, business, or rental income).

**Requirements:**
- KRA PIN
- iTax password
- Active email (for the acknowledgement receipt)

**Steps:**
1. Log in to https://itax.kra.go.ke with PIN and password
2. Go to **Returns → File Nil Return**
3. Select tax obligation: **Income Tax – Resident Individual**
4. Confirm the return period (previous calendar year, January–December)
5. Submit
6. Download the **e-Return Acknowledgement Receipt** and give it to the customer

**Deadline:** 30 June of the following year. Late filing attracts penalties.

---

## 4. P9 Returns (Employer returns)

**Price:** KES 200–300

**Steps:**
1. Log in to iTax
2. Go to **Returns → File Return → P9**
3. Upload/enter employee details as per the P9 form
4. Submit and download the acknowledgement
5. The employer must keep the P9 form for their records

---

## 5. Withholding Certificate Returns

**Price:** KES 300

**Steps:**
1. Log in to iTax
2. Go to **Returns → File Return → Withholding Tax**
3. Enter the withholding details and submit
4. Download the acknowledgement

---

## 6. Tax Compliance Certificate (TCC)

**Price:** KES 100

**Requirements:**
- KRA PIN and iTax password
- All returns for all applicable years must be filed
- No outstanding tax liabilities

**Steps:**
1. Log in to iTax
2. Go to **Certificates → Apply for Tax Compliance Certificate (TCC)**
3. Fill in the reason for application
4. Submit
5. The TCC is issued only if the customer has filed all returns and has no outstanding tax

---

## 7. KRA PIN Update (change of details)

**Price:** KES 150 (or KES 200 if new email required)

**Steps:**
1. Log in to iTax
2. Go to **Registration → Amend PIN Details**
3. Select what to update (address, phone, email, name, etc.)
4. Enter the new details
5. Submit and download the updated PIN certificate

---

## 8. KRA Email Reset

**Price:** KES 500

**When needed:** the customer no longer has access to the email address registered on iTax.

**Steps:**
1. Customer must visit a **KRA office** or **Huduma Centre** in person with original ID — KRA does not allow email changes online for security reasons
2. Request an email change; the officer will update it
3. After the change, log in to iTax with the new email and reset the password if needed

---

## Contact FrankTechSpace

- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // NTSA SERVICES
  // ============================================================
  {
    title: "NTSA TIMS Services — Driving Licence, Vehicle Transfer, Inspection, Search, Change of Particulars",
    category: "Government e-Services",
    content: `# NTSA (National Transport and Safety Authority) Services

FrankTechSpace assists with all NTSA services via the **TIMS portal** (timsvirtual.ntsa.go.ke).

## General requirements
- Original National ID
- Active phone number registered in the customer's own name (OTP is sent here)
- Active email address
- KRA PIN (for most vehicle-related services)
- For vehicles: valid insurance and clearance of any outstanding NTSA fees

---

## 1. NTSA PDL (Provisional Driving Licence)

**Price:** KES 950

**Requirements:**
- Original ID
- Active phone number and email
- Passport photo (digital)
- Payment via M-Pesa

**Steps:**
1. Log in to https://timsvirtual.ntsa.go.ke
2. Go to **Driving Licence → Apply for PDL**
3. Fill in the application (ID, name, contact)
4. Select the driving school (if applicable)
5. Upload the required documents
6. Pay via M-Pesa using the invoice number
7. Print the acknowledgement and give it to the customer

---

## 2. NTSA Smart DL (Smart Driving Licence)

**Price:** KES 3,300

**Steps:**
1. Log in to TIMS
2. Go to **Driving Licence → Apply for Smart DL**
3. Confirm personal details
4. Select class and duration
5. Upload photo and signature
6. Pay the fee via M-Pesa
7. Print the acknowledgement. The card is collected at the indicated NTSA office or delivered

---

## 3. 1-Year Driving Licence Renewal

**Price:** KES 950

**Steps:**
1. Log in to TIMS
2. Go to **Driving Licence → Renew**
3. Select the class and duration (1 year)
4. Confirm details
5. Pay via M-Pesa
6. Print the acknowledgement. Card is collected or delivered

---

## 4. PSV Application

**Price:** KES 350

**Steps:**
1. Log in to TIMS
2. Go to **Driving Licence → PSV Endorsement**
3. Upload the required documents (ID, existing licence, good conduct)
4. Pay the fee via M-Pesa
5. Print the acknowledgement

---

## 5. Reflective Number Plate

**Price:** KES 500

**Steps:**
1. Log in to TIMS
2. Go to **Vehicle Registration → Reflective Number Plate**
3. Select the vehicle (enter registration number)
4. Upload supporting documents
5. Pay via M-Pesa
6. Collect from the indicated NTSA office

---

## 6. Vehicle Transfer of Ownership

**Price:** KES 300 (service fee) + NTSA transfer fee

**Steps:**
1. Both buyer and seller must be registered on TIMS
2. Seller initiates the transfer: log in → **Vehicle → Transfer of Ownership**
3. Enter buyer's ID and details
4. Buyer accepts the transfer on their own TIMS account
5. Upload required documents (ID copies, KRA PIN, insurance, inspection certificate if applicable)
6. Pay the transfer fee via M-Pesa
7. New logbook is issued in the buyer's name

---

## 7. Vehicle Inspection

**Price:** KES 300 (FrankTechSpace service) + NTSA inspection fee

**Steps:**
1. Log in to TIMS
2. Go to **Vehicle → Book Inspection**
3. Select the NTSA inspection centre and date
4. Pay the inspection fee via M-Pesa
5. Print the booking slip. Bring the vehicle and slip on the inspection date

---

## 8. Vehicle Change of Particulars

**Price:** KES 250

**Steps:**
1. Log in to TIMS
2. Go to **Vehicle → Change of Particulars**
3. Select what to change (colour, engine, body type, etc.)
4. Upload supporting documents
5. Pay the fee and submit
6. Download the updated logbook or acknowledgement

---

## 9. Copy of Records / Vehicle Search

**Price:** KES 300

**Steps:**
1. Log in to TIMS
2. Go to **Vehicle → Copy of Records**
3. Enter the vehicle registration number
4. Pay the fee
5. Download the vehicle search report

---

## Common problems
- **OTP not received:** confirm the phone number is registered in the customer's own name; retry after 2–3 minutes
- **Details mismatch:** visit an NTSA office or Huduma Centre with the original ID
- **Payment pending:** do not pay twice; wait 10–15 minutes and refresh
- **Portal slow:** try early morning or late evening; use Chrome or Edge

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // BUSINESS & COMPANY REGISTRATION
  // ============================================================
  {
    title: "Business Name Registration (eCitizen)",
    category: "Business Services",
    content: `# Business Name Registration

**Price:** KES 1,500 (FrankTechSpace service) + government fee

## Requirements
- Original National ID of the owner(s)
- KRA PIN
- Active phone number and email
- Proposed business names (at least 3 options — names may be rejected if too similar to existing ones)
- Business physical address
- Passport photo (digital)

## Steps (via eCitizen)
1. Log in to https://www.ecitizen.go.ke
2. Go to **Ministries & Departments → Business Registration Service (BRS)**
3. Select **Business Name Registration**
4. Enter the proposed business names (in order of preference)
5. Fill in the owner's details, business address, and business activity
6. Upload the required documents (ID, KRA PIN, passport photo)
7. Review and submit
8. Pay the government fee via M-Pesa
9. Download the business name certificate — usually issued within 1–3 working days

## Common problems
- **Name rejected:** propose new names or add a distinguishing word
- **Payment failed:** do not pay twice; wait 15 minutes and check the invoice status
- **Details mismatch:** ensure the ID details on eCitizen match the KRA PIN records

## After registration
- Apply for a business permit from the county government
- Register a till number if the business will accept payments
- Consider registering for VAT if annual turnover exceeds the threshold

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  {
    title: "Company Registration (eCitizen BRS)",
    category: "Business Services",
    content: `# Company Registration

**Price:** KES 18,700 (FrankTechSpace service + government fee)

## Requirements
- Original IDs of all directors and the company secretary
- KRA PINs of all directors
- Passport photos of directors
- Proposed company names (at least 3)
- Registered office address
- Shareholding structure
- Memorandum and Articles of Association (may need to be drafted)

## Steps (via eCitizen BRS)
1. Log in to https://www.ecitizen.go.ke
2. Go to **Ministries & Departments → Business Registration Service (BRS)**
3. Select **Company Registration**
4. **Name search:** submit 3 proposed names and pay the name search fee
5. After approval, fill in the company details: registered office, share capital, directors, secretary
6. Upload supporting documents (IDs, KRA PINs, passport photos, CR12 for corporate shareholders if any)
7. Submit the application
8. Pay the registration fee via M-Pesa
9. Download the Certificate of Incorporation — usually issued within a few working days

## After registration
- Apply for the company KRA PIN
- Register for VAT if applicable
- Register with NSSF and NHIF/SHA if employing staff
- Apply for a business permit from the county

## Optional add-ons
- **CR12** (Company Profile): KES 1,000
- **Articles of Association:** KES 1,500
- **Company Profile & Articles:** KES 2,500

## Common problems
- **Name rejected:** propose new names or add a distinguishing word
- **Directors' IDs not matching KRA PIN:** verify details on iTax before applying

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // GOOD CONDUCT
  // ============================================================
  {
    title: "Good Conduct Certificate (Police Clearance)",
    category: "Government e-Services",
    content: `# Good Conduct Certificate Application

**Price:** KES 1,500 (FrankTechSpace service + government fee)

## Requirements
- Original National ID
- Active phone number and email registered in the customer's name
- Passport photo (digital)
- Fingerprints (taken at DCI offices or designated centres)
- Payment via M-Pesa

## Steps (via eCitizen DCI section)
1. Log in to https://www.ecitizen.go.ke
2. Go to **Ministries & Departments → Directorate of Criminal Investigations (DCI)**
3. Select **Police Clearance Certificate**
4. Fill in the applicant's details
5. Upload the passport photo
6. Choose the fingerprinting centre and book an appointment
7. Pay the government fee via M-Pesa
8. Print the invoice and the fingerprinting appointment slip
9. The customer attends the fingerprinting centre on the scheduled date
10. The certificate is emailed within 2–3 weeks after fingerprinting

## Fingerprinting centres
DCI headquarters (Nairobi), Huduma Centres, and designated regional DCI offices.

## Common problems
- **Fingerprints rejected:** re-do at the same centre
- **Certificate delayed:** check the DCI portal for status; if past 3 weeks, follow up at the fingerprinting centre
- **Payment pending:** do not pay twice

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // PASSPORT
  // ============================================================
  {
    title: "Passport Application & Temporary Passport",
    category: "Government e-Services",
    content: `# Passport Application

**Price:** KES 1,050 (FrankTechSpace service + government fee)

## Requirements (for new applications and renewals)
- Original National ID
- Original birth certificate
- Passport photos (digital, white background, taken recently)
- Recommendation letter from the local chief, sub-chief, or a recognized person (for first-time applicants)
- Previous passport (for renewals)
- Payment via eCitizen

## Steps (via eCitizen)
1. Log in to https://www.ecitizen.go.ke
2. Go to **Ministries & Departments → Immigration Services**
3. Select **Passport Application** (or **Passport Renewal**)
4. Fill in the applicant's details (names exactly as on ID and birth certificate)
5. Upload the required documents and photo
6. Choose the passport station and appointment date
7. Pay the government fee via M-Pesa
8. Print the confirmation slip
9. Attend the immigration office on the scheduled date for biometrics and document verification
10. Passport is issued and collected after processing (typically 2–3 weeks)

## Temporary Passport
**Price:** KES 300 (FrankTechSpace service + government fee)

Steps are similar; select **Temporary Passport** instead. Usually issued within 24–48 hours for emergency travel.

## Common problems
- **Photo rejected:** must meet the specifications (white background, no shadows, no glasses)
- **Details mismatch:** names on ID and birth certificate must match exactly
- **Appointment delayed:** book early — slots fill quickly

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // HELB
  // ============================================================
  {
    title: "HELB Services — Account Creation, Loan Application, Clearance Certificate",
    category: "Government e-Services",
    content: `# HELB (Higher Education Loans Board) Services

FrankTechSpace assists with HELB account creation, loan applications, and clearance certificates.

## 1. HELB Account Creation

**Price:** KES 200

**Requirements:**
- National ID (or birth certificate for under-18)
- KCSE index number
- University/college admission letter
- Active phone number and email registered in the customer's name
- Parent/guardian ID (for guarantor section)

**Steps:**
1. Open https://www.helb.co.ke
2. Click **Register** to create an account
3. Enter ID/birth certificate number, phone, email
4. Set a password
5. Log in and complete the profile
6. Save the HELB username/password for the customer

## 2. HELB Loan Application

**Price:** KES 500

**Steps:**
1. Log in to the HELB portal
2. Go to **Loan Application**
3. Fill in personal details, academic details, and family background
4. Enter the bank account details (the customer's own bank or M-Pesa)
5. Add guarantors (two, with their IDs and phone numbers)
6. Upload the required documents (ID, admission letter, KCSE certificate, bank details, guarantor details)
7. Submit the application
8. Print the acknowledgment receipt

## 3. HELB Clearance Certificate

**Price:** KES 1,200

**When needed:** the customer has fully repaid their HELB loan and needs a clearance certificate (e.g. for employment, TSC, or travel abroad).

**Steps:**
1. Log in to the HELB portal
2. Go to **Clearance Certificate**
3. Confirm the loan balance is zero
4. Pay any outstanding balance if any
5. Apply for the certificate
6. Download and print the certificate

## Common problems
- **Login failed:** reset password via the portal; if the registered email is inaccessible, visit a HELB office
- **Loan delayed:** ensure the HELB account is fully verified and the bank details are correct
- **Clearance delayed:** confirm all payments have cleared; HELB needs 1–2 weeks to process

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // KUCCPS
  // ============================================================
  {
    title: "KUCCPS — First-Time Application",
    category: "Government e-Services",
    content: `# KUCCPS (Kenya Universities and Colleges Central Placement Service) — First-Time Application

**Price:** KES 750

## Requirements
- KCSE index number and year
- KCSE result slip (or certificate)
- Original National ID (or birth certificate for minors)
- Active phone number and email registered in the applicant's name
- Payment via M-Pesa

## Steps
1. Open https://students.kuccps.net
2. Click **Register** to create an account
3. Enter the KCSE index number, year, and other details
4. Verify with the OTP sent by SMS
5. Log in and complete the profile
6. Select degree/diploma programmes in order of preference
7. Review the choices
8. Pay the application fee via M-Pesa
9. Submit the application
10. Print the acknowledgement receipt

## Common problems
- **Index number not found:** verify the exact spelling and year
- **OTP not received:** confirm the phone is registered in the applicant's name; retry
- **Portal slow near deadlines:** apply early

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // NHIF / SHA
  // ============================================================
  {
    title: "SHA (Social Health Authority) Registration & Returns",
    category: "Government e-Services",
    content: `# SHA (Social Health Authority) Registration & Returns

**Price:** Registration KES 400 · Returns KES 300

**Note:** SHA replaced NHIF in October 2024. Some customers may still refer to "NHIF" — this is the same service.

## Requirements
- Original National ID
- Active phone number registered in the customer's own name (OTP is sent here)
- Details of household members: spouse ID, children's birth certificate numbers
- Income information (for contribution means-testing)

## Registration channels
- Online self-service portal at https://sha.go.ke
- USSD: dial *147# and follow the prompts
- Official SHA mobile app
- In person at SHA offices, Huduma Centres, or designated health facilities

## Steps (online registration)
1. Open https://sha.go.ke and choose the registration/self-service option
2. Select the identification type and enter the ID number
3. Enter the phone number and verify with the OTP sent by SMS
4. Confirm personal details retrieved from government records
5. Add dependants/household members
6. Complete the means-testing/income questions
7. Submit and note the confirmation
8. Record the customer's contribution amount and payment instructions

## SHA Returns (for employers)
1. Log in to the SHA employer portal
2. Upload the monthly returns file
3. Verify the details
4. Submit and download the acknowledgement

## Common problems
- **OTP not received:** confirm the phone number is registered in the customer's name; retry after a few minutes
- **Details not found:** visit an SHA office or Huduma Centre to verify the ID
- **Portal not loading:** try a different browser or during off-peak hours

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // NSSF
  // ============================================================
  {
    title: "NSSF Registration & Returns",
    category: "Government e-Services",
    content: `# NSSF (National Social Security Fund) Registration & Returns

**Price:** Registration KES 300 · Returns KES 300

## 1. NSSF Member Registration

**Requirements:**
- Original National ID
- Active phone number and email
- KRA PIN (for employed persons)

**Steps:**
1. Open https://www.nssf.or.ke
2. Click **Register** (or **Member Registration**)
3. Enter ID number, names, phone, email
4. Set a password
5. Log in and complete the profile (employment details, employer's NSSF number if applicable)
6. Save the NSSF number and password for the customer

## 2. NSSF Returns (employer)

**Requirements:**
- Employer NSSF number
- Employee details (IDs, NSSF numbers, salaries)
- Payment

**Steps:**
1. Log in to the NSSF employer portal
2. Go to **Returns**
3. Upload the monthly returns file (NSSF provides a template)
4. Verify employee details and contributions
5. Submit
6. Pay the contribution via the employer's bank or M-Pesa
7. Download the acknowledgement

## Common problems
- **Details mismatch:** verify the ID and NSSF number on file
- **Payment not reflecting:** confirm the bank reference; contact NSSF if delayed beyond 48 hours

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // BIRTH CERTIFICATE
  // ============================================================
  {
    title: "Birth Certificate Registration & Change of Particulars",
    category: "Government e-Services",
    content: `# Birth Certificate Registration & Change of Particulars

**Price:** KES 600

## 1. New Birth Certificate (Registration)

**Requirements:**
- Child's birth notification (from the hospital)
- Parents' original National IDs
- Parents' marriage certificate (if married)
- Grandparents' details (for the "informant" section)
- Payment via eCitizen

**Steps:**
1. Log in to https://www.ecitizen.go.ke
2. Go to **Ministries & Departments → Civil Registration Services (CRS)**
3. Select **Birth Certificate → Registration**
4. Fill in the child's details, parents' details, and grandparents' details
5. Upload the birth notification and parents' IDs
6. Select the CRS office for collection
7. Pay the government fee via M-Pesa
8. Print the acknowledgment
9. Attend the CRS office for the biometrics and collection

## 2. Birth Certificate Change of Particulars

**Price:** KES 600

**When needed:** the name or date of birth on the certificate needs correction.

**Steps:**
1. Log in to eCitizen → CRS
2. Select **Birth Certificate → Change of Particulars**
3. Upload the supporting documents (affidavit from a Commissioner of Oaths, ID, existing certificate)
4. Submit and pay the fee
5. Attend the CRS office to complete the change

## Common problems
- **Grandparents' details unknown:** the parents can provide what they have; CRS may accept a sworn affidavit
- **Birth notification lost:** obtain a duplicate from the hospital before applying

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // NATIONAL ID
  // ============================================================
  {
    title: "National ID Registration & Change of Particulars",
    category: "Government e-Services",
    content: `# National ID Registration & Change of Particulars

**Price:** KES 1,600

## 1. New National ID Registration (first-time)

**Requirements:**
- Original birth certificate
- Parents' original IDs
- Original KCSE result slip / school leaving certificate (if applicable)
- Passport photo (digital)
- Payment via eCitizen (if using eCitizen option) OR free at a Huduma Centre

**Steps (via eCitizen / Huduma Centre booking):**
1. Log in to https://www.ecitizen.go.ke
2. Go to **Ministries & Departments → National Registration Bureau (NRB)**
3. Select **ID Application**
4. Fill in the applicant's details
5. Upload the required documents
6. Choose the NRB office and appointment date
7. Pay the fee (if applicable)
8. Attend the NRB office on the appointment date for biometrics
9. ID is issued and collected after processing (typically 2–3 weeks)

## 2. ID Change of Particulars

**Price:** KES 1,600

**When needed:** name, date of birth, or other details on the ID need to be corrected.

**Requirements:**
- Original ID
- Supporting documents (birth certificate, affidavit from a Commissioner of Oaths, marriage certificate if name change)
- Passport photo

**Steps:**
1. Log in to eCitizen → NRB
2. Select **Change of Particulars**
3. Upload the supporting documents
4. Submit and pay the fee
5. Attend the NRB office to complete the change

## Common problems
- **Birth certificate details differ from ID:** both must be corrected consistently; start with the birth certificate
- **Supporting affidavit required:** the customer must visit a Commissioner of Oaths before applying

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },
];