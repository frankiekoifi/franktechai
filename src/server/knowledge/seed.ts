const STARTER = "FrankTechSpace starter knowledge (review & update)";

export const SEED_DOCUMENTS: {
  title: string;
  category: string;
  content: string;
  source: string;
  status: string;
}[] = [
  {
    title: "FrankTechSpace Services Overview",
    category: "FrankTechSpace",
    status: "draft",
    source:
      "Template — edit with the real FrankTechSpace service list, prices and hours, then publish",
    content: `# FrankTechSpace Services Overview

(ADMIN: This is a template. Replace the placeholders below with FrankTechSpace's actual services, prices, opening hours and contacts, then set the status to Published.)

## Services
- [Service 1 — e.g. printing, photocopying, scanning]
- [Service 2 — e.g. government e-services assistance]
- [Service 3 — e.g. computer repair & software installation]

## Opening hours
- [Days and hours]

## Contact
- [Phone / WhatsApp / email / location]`,
  },
  {
    title: "Printer Offline / Not Printing Troubleshooting Guide",
    category: "Printers",
    status: "published",
    source: STARTER,
    content: `# Printer Offline / Not Printing Troubleshooting Guide

## First questions to ask
- Printer brand and model (e.g. Epson L3110, HP LaserJet, Canon).
- Connection type: USB, Wi-Fi or network cable.
- Any lights blinking or error message on the printer or computer?
- Does it affect one computer or all computers?

## Basic checks
1. Confirm the printer is powered ON and not showing an error light.
2. Confirm paper is loaded and there is no paper jam.
3. Check ink / toner levels.
4. USB: reseat the cable at both ends, try another USB port and avoid USB hubs.
5. Network/Wi-Fi: confirm the printer and computer are on the same network; print the printer's network configuration page to see its IP address.

## Windows checks
1. Open Settings > Bluetooth & devices > Printers & scanners (Windows 11) or Settings > Devices > Printers & scanners (Windows 10).
2. Select the printer and make sure it is the one being printed to (check "Let Windows manage my default printer").
3. Open the print queue ("Open print queue"). Cancel all stuck documents.
4. In the queue window, open the Printer menu and untick "Use Printer Offline" and "Pause Printing".
5. Restart the Print Spooler: press Win+R, type services.msc, find "Print Spooler", right-click > Restart.
6. Print a test page: Printer properties > Print Test Page.
7. Run the built-in troubleshooter (Settings > System > Troubleshoot > Other troubleshooters > Printer).

## Still offline
- Remove the printer from Windows and add it again.
- Download and install the latest driver from the manufacturer's official website (e.g. epson.com, hp.com, canon.com) for the exact model.
- For network printers, if the IP address changed, re-add the printer using the new IP or reserve a fixed IP on the router.

## Epson EcoTank (L-series, e.g. L3110 / L3150) notes
- Faint, streaky or missing colours: run Nozzle Check, then Head Cleaning from the Epson printer utility (Printer properties > Maintenance). Avoid running many cleanings back-to-back.
- Paper and ink lights blinking together can indicate a paper jam or that the ink pads need service — check the Epson status monitor message. Ink pad service should be done by a qualified technician.
- Only refill with the correct Epson ink bottles for that model.`,
  },
  {
    title: "No Internet / Wi-Fi Troubleshooting Guide",
    category: "Networking",
    status: "published",
    source: STARTER,
    content: `# No Internet / Wi-Fi Troubleshooting Guide

## Narrow down the problem first
Ask whether the problem affects:
1. Only this computer
2. All computers / phones
3. Wi-Fi only
4. Both Wi-Fi and Ethernet (cable)

- All devices affected: the problem is likely the router, modem or internet service provider (ISP).
- Only one device affected: the problem is likely that device's settings, adapter or driver.

## If ALL devices have no internet
1. Restart the modem/router: unplug power for 30 seconds, plug back in and wait 2–3 minutes.
2. Check the router lights (Internet/WAN/LOS). A red LOS light usually means a fibre/line fault — contact the ISP.
3. Confirm the internet bundle / subscription is active and paid.
4. Check cables between the ISP box and the router.
5. Contact the ISP if the router shows no internet connection.

## If only ONE computer has no internet
1. Make sure Airplane mode is OFF and Wi-Fi is turned on.
2. Forget the network and reconnect: Settings > Network & internet > Wi-Fi > Manage known networks > Forget, then reconnect with the correct password.
3. Run the Network troubleshooter (Settings > System > Troubleshoot > Other troubleshooters).
4. Reset the network stack. Open Command Prompt as Administrator and run:
   \`\`\`
   ipconfig /release
   ipconfig /renew
   ipconfig /flushdns
   netsh winsock reset
   netsh int ip reset
   \`\`\`
   Then restart the computer.
5. Check the network adapter in Device Manager (Win+X > Device Manager > Network adapters). If there is a yellow warning icon, update or reinstall the driver.
6. Check date and time are correct (wrong time breaks secure websites).
7. Disable any VPN or proxy temporarily (Settings > Network & internet > Proxy).
8. Last resort: Settings > Network & internet > Advanced network settings > Network reset.

## Connecting a computer to Wi-Fi (Windows)
1. Click the network icon on the taskbar (bottom-right).
2. Select the Wi-Fi network name (SSID).
3. Tick "Connect automatically" if desired, click Connect.
4. Enter the Wi-Fi password and confirm.
5. If the network is not listed, check that Wi-Fi is enabled and that the adapter appears in Device Manager.`,
  },
  {
    title: "Slow Computer Troubleshooting Guide",
    category: "Windows",
    status: "published",
    source: STARTER,
    content: `# Slow Computer Troubleshooting Guide

## Ask first
- Is it slow all the time, only at startup, or only with certain programs/websites?
- When did it start (after an update, new software, virus)?
- Is it a desktop or laptop, and does it have an HDD or SSD?

## Steps
1. Restart the computer (not just sleep).
2. Open Task Manager (Ctrl+Shift+Esc) > Processes. Sort by CPU, Memory and Disk to find what is using resources.
3. Disable unnecessary startup programs: Task Manager > Startup apps > Disable.
4. Free disk space: keep at least 15–20% of the system drive free. Use Settings > System > Storage > Temporary files, or Disk Cleanup.
5. Uninstall programs that are not needed (Settings > Apps).
6. Run a full antivirus scan (Windows Security > Virus & threat protection > Scan options > Full scan).
7. Install pending Windows Updates and restart.
8. Check the disk health: a constantly 100% busy HDD often indicates an old or failing disk. Upgrading from HDD to SSD gives the largest speed improvement on older PCs.
9. Check RAM: 4 GB is very limited for Windows 10/11; 8 GB or more is recommended.
10. Laptops: check for overheating (blocked vents, dust). Set the power mode to Balanced/Best performance when plugged in.`,
  },
  {
    title: "Scanning Documents and Converting to PDF",
    category: "Office & Documents",
    status: "published",
    source: STARTER,
    content: `# Scanning Documents and Converting to PDF

## Scanning a document (Windows)
1. Place the document face down on the scanner glass, aligned to the corner marker.
2. Option A — Windows Scan app: open "Windows Scan" (install from Microsoft Store if missing), choose the scanner, select file type (PDF or JPEG), colour mode and resolution (300 dpi is good for documents), then click Scan.
3. Option B — Windows Fax and Scan: Start > Windows Fax and Scan > New Scan.
4. Option C — the manufacturer's software (e.g. Epson Scan 2, HP Smart, Canon IJ Scan Utility), which can often save directly as PDF and scan multiple pages into one PDF.
5. Save the file with a clear name and confirm it opens correctly before sending it to the customer.

Tips: use 200–300 dpi for documents; use greyscale for text-only documents to keep file sizes small; many online portals limit uploads to 1–2 MB.

## Converting a document to PDF
- Microsoft Word / Excel / PowerPoint: File > Save As (or Export) > choose PDF.
- Any program that can print: Print > choose "Microsoft Print to PDF" > Print > choose a file name.
- Google Docs: File > Download > PDF Document.
- Images to PDF: select the images in File Explorer > right-click > Print > "Microsoft Print to PDF".
- Phones: most scanning apps (e.g. Microsoft Lens, Google Drive scan) save as PDF.

## Reducing PDF size
- Re-scan at a lower resolution or in greyscale.
- In Word, File > Save As > PDF > "Minimum size (publishing online)".`,
  },
  {
    title: "Installing Windows 10 / 11 from USB",
    category: "Windows",
    status: "published",
    source: STARTER,
    content: `# Installing Windows 10 / 11 from USB

## Requirements
- A USB flash drive of at least 8 GB (it will be erased).
- Another working PC with internet to create the installer.
- Back up the customer's data first — a clean install erases the selected drive.
- Windows 11 needs TPM 2.0, Secure Boot, a supported CPU, 4 GB RAM and 64 GB storage. Older PCs may need Windows 10.
- A valid Windows licence/product key (many PCs have a digital licence that activates automatically).

## Create the bootable USB
1. Download the official Media Creation Tool from microsoft.com/software-download (Windows 10 or Windows 11).
2. Run it, accept the licence, choose "Create installation media (USB flash drive)".
3. Select language/edition, choose the USB drive and wait for it to finish.

## Install
1. Insert the USB into the target PC and restart.
2. Open the boot menu (commonly F12, F11, F9, F8 or Esc depending on the manufacturer) and choose the USB drive. If needed, enter BIOS/UEFI (F2/Del) and set USB first in boot order.
3. Choose language > Install now.
4. Enter a product key or choose "I don't have a product key" (it can activate later).
5. Choose the edition that matches the licence (e.g. Home or Pro).
6. Select "Custom: Install Windows only (advanced)".
7. Select the drive/partition. For a clean install, delete the old Windows partitions on the target disk and select the unallocated space. Double-check you are not deleting a data drive.
8. Wait for installation; the PC restarts several times. Remove the USB when setup starts the out-of-box experience.
9. Complete region, keyboard, network and account setup.

## After installation
- Run Windows Update until no updates remain.
- Install missing drivers (Device Manager; manufacturer's support site).
- Install antivirus if needed, browsers, office software and restore the customer's data.`,
  },
  {
    title: "KRA iTax: PIN Registration, PIN Retrieval and Nil Returns (Kenya)",
    category: "Government e-Services",
    status: "published",
    source: STARTER + " — verify on itax.kra.go.ke as procedures change",
    content: `# KRA iTax Services (Kenya)

Note: KRA procedures and portal layouts change from time to time. Always confirm on the official portal https://itax.kra.go.ke before assisting a customer.

## Which KRA service does the customer need?
- New PIN registration
- PIN retrieval / forgotten password
- Filing a Nil return
- Filing an income tax return (employment, P9)
- Tax Compliance Certificate (TCC)
- Updating iTax account details

## Documents / information needed (individual, Kenyan resident)
- Original National ID card (ID number and date of birth)
- An active email address the customer can access (the PIN certificate and password are sent there)
- An active phone number
- Physical address details (county, town, street)
- Employer's PIN (if employed) — optional in some cases

## New PIN registration (individual)
1. Go to https://itax.kra.go.ke and click "New PIN Registration".
2. Select taxpayer type "Individual" and mode of registration "Online Form", then Next.
3. Fill in basic information: ID number, date of birth, names (auto-validated against IPRS), email and phone.
4. Fill in address details and obligation details (typically "Income Tax – Resident Individual").
5. Submit and solve the arithmetic security question.
6. The PIN certificate is sent to the customer's email. Download/print it for them.

## PIN retrieval / reset password
- If the customer forgot the password: on the iTax login page enter the PIN, click "Forgot Password/Unlock Account", and a new password is sent to the registered email.
- If they don't know their PIN: KRA offers PIN checking/retrieval services (e.g. the "PIN Checker" on the iTax site, or contacting KRA). If the registered email is no longer accessible, the customer must request an email change through KRA support.

## Filing a Nil return
Use only when the customer had NO income in the year (no employment, business or rental income).
1. Log in to iTax with the PIN and password.
2. Go to Returns > File Nil Return.
3. Select tax obligation "Income Tax – Resident Individual" and click Next.
4. Confirm the return period (the previous year, January–December) and submit.
5. Download the e-Return Acknowledgement Receipt and give it to the customer.

The annual deadline for individual returns is 30 June of the following year. Late filing attracts penalties.

## Tax Compliance Certificate (TCC)
1. Log in to iTax > Certificates > Apply for Tax Compliance Certificate (TCC).
2. Fill in the reason for application and submit.
3. The TCC is issued only if the customer has filed all returns and has no outstanding tax liabilities.`,
  },
  {
    title: "SHA (Social Health Authority) Registration Guide (Kenya)",
    category: "Government e-Services",
    status: "published",
    source: STARTER + " — verify on sha.go.ke as procedures change",
    content: `# SHA (Social Health Authority) Registration Guide (Kenya)

Note: SHA replaced NHIF in October 2024. Procedures, channels and contribution rules may change — confirm on the official SHA website (https://sha.go.ke) or with SHA before assisting a customer.

## Registration channels
- Online self-service portal (via the official SHA website)
- USSD: dial *147# on a registered Safaricom/Airtel/Telkom line and follow the prompts
- The official mobile app (as linked from the SHA website)
- In person at SHA offices, Huduma Centres or designated health facilities

## Information / documents the customer needs
- Kenyan National ID number (or birth certificate number / other ID for other categories)
- A phone number registered in the customer's own name (an OTP is sent to it)
- Details of household members to be added as beneficiaries: spouse ID number, children's birth certificate numbers
- Income information (employment or informal income) used for contribution means-testing

## Online registration (general steps)
1. Open the official SHA website and choose the registration/self-service option.
2. Select the identification type and enter the ID number.
3. Enter the phone number and verify it with the OTP sent by SMS.
4. Confirm personal details retrieved from government records.
5. Add dependants/household members.
6. Complete the means-testing/income questions.
7. Submit and note the confirmation. Record the customer's contribution amount and payment instructions shown.

## Common problems
- OTP not received: confirm the phone number is registered in the customer's name and has network; retry after a few minutes.
- Details not found: the customer's ID details may need verification at an SHA office or Huduma Centre.
- Portal not loading: try a different browser, clear cache, or try again during off-peak hours.`,
  },
  {
    title: "eCitizen / Government Portal Not Loading",
    category: "Government e-Services",
    status: "published",
    source: STARTER,
    content: `# eCitizen / Government Portal Not Loading

## Quick checks
1. Confirm the internet works by opening another website (e.g. google.com).
2. Check the address: use the official address https://accounts.ecitizen.go.ke or https://www.ecitizen.go.ke — beware of fake look-alike sites.
3. Try a private/incognito window (Ctrl+Shift+N in Chrome/Edge). If it works there, the problem is cached data or an extension.
4. Clear browser cache and cookies for the site (Ctrl+Shift+Delete > Cookies and Cached images).
5. Try a different, updated browser (Chrome, Edge, Firefox).
6. Check the computer's date and time — wrong time causes "Your connection is not private" errors.
7. Disable VPN, proxy or ad-blocking extensions temporarily.
8. Flush DNS: open Command Prompt and run \`ipconfig /flushdns\`.
9. The portal may be down or under maintenance, especially near deadlines. Wait and retry later, or check official eCitizen / government social media for outage notices.

## Login issues
- Forgotten password: use "Forgot password" on the login page; the reset link/OTP goes to the registered email/phone.
- OTP not received: confirm the phone number, check SMS inbox/spam, wait a few minutes before requesting again.

## Payments
- Do not pay twice if a payment appears pending. Check the invoice status in the account first; payments can take several minutes to reflect.
- Keep the M-Pesa/transaction message as proof.`,
  },
];
