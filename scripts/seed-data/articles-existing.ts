/**
 * FrankTechSpace AI — Existing knowledge base, polished
 * Originally from src/server/knowledge/seed.ts
 * Rewritten with cleaner structure and consistent formatting.
 */

import type { SeedArticle } from "./articles-procedures";

export const EXISTING_ARTICLES: SeedArticle[] = [
  // ============================================================
  // SERVICES OVERVIEW
  // ============================================================
  {
    title: "FrankTechSpace — Services Overview",
    category: "FrankTechSpace",
    content: `# FrankTechSpace — Services Overview

FrankTechSpace is a Kenyan cyber café and digital services provider serving individuals, businesses, and institutions with printing, government e-services assistance, computer support, and internet services.

For the full price list, see the article **"FrankTechSpace Full Price List"** in the knowledge base.

## Core services

### Printing & Documents
- Black & white printing, photocopying, and scanning
- Colour printing and photo printing
- Lamination and binding
- Typing, document formatting, and page numbering
- Passport photos
- CV writing and job application letters
- Project printing, proposal consultation, and document design

### Government e-Services Assistance
- KRA (iTax) — PIN registration, PIN retrieval, Nil returns, P9, TCC, PIN update, email reset
- eCitizen — account creation, password recovery, and portal services
- NTSA TIMS — driving licence, PSV, number plates, vehicle transfer, inspection, search, change of particulars
- Business Registration Service (BRS) — business name, company registration, till number, AGPO
- HELB — account creation, loan application, clearance certificate
- KUCCPS — first-time application and account support
- Good Conduct (Police Clearance) — application, fingerprinting, follow-up
- Immigration — passport application, temporary passport, visa, travel document authentication
- Civil Registration — birth certificate, ID registration and change of particulars, marriage certificate
- SHA (formerly NHIF) — registration and returns
- NSSF — registration and returns
- Ardhi Sasa — account, property search, property addition
- IFMIS — account creation
- TSC — number application, wealth declaration
- GHRIS — registration and payslips
- KMTC — account and application
- Metropol CRB — certificate

### Computer & IT Support
- Windows 10 / 11 installation and activation
- Virus removal and system cleanup
- Software installation (Office, antivirus, browsers, drivers)
- Printer setup and troubleshooting (USB and Wi-Fi)
- Data backup and recovery
- Basic hardware diagnostics and repair

### Internet & Online Services
- Internet browsing and email
- Online job applications
- Online form filling and uploads
- Website creation (KSh 50,000 – 250,000)

### Office Supplies & Branding
- Branded envelopes (DL, A5, A4; brown or white)
- Custom printing and branding on request

## Contact
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com

## Payment
- **Paybill (Equity):** 247247, Account 11211
- **Send money (M-Pesa):** 0721971130
- **Cash:** accepted at the counter

For specific prices, see the article **"FrankTechSpace Full Price List"**.`,
  },

  // ============================================================
  // PRINTER TROUBLESHOOTING
  // ============================================================
  {
    title: "Printer Offline / Not Printing — Troubleshooting Guide",
    category: "Printers",
    content: `# Printer Offline / Not Printing — Troubleshooting Guide

## First questions to ask the customer
- Printer brand and model (e.g. Epson L3110, HP LaserJet, Canon)
- Connection type: USB, Wi-Fi, or network cable
- Any lights blinking or error messages on the printer or computer?
- Does it affect one computer or all computers?

## Basic checks
1. Confirm the printer is powered ON and not showing an error light
2. Confirm paper is loaded and there is no paper jam
3. Check ink / toner levels
4. **USB:** reseat the cable at both ends, try another USB port, avoid USB hubs
5. **Network/Wi-Fi:** confirm the printer and computer are on the same network. Print the printer's network configuration page to see its IP address

## Windows checks
1. Open **Settings → Bluetooth & devices → Printers & scanners** (Windows 11) or **Settings → Devices → Printers & scanners** (Windows 10)
2. Select the printer and make sure it is the default (check "Let Windows manage my default printer")
3. Open the print queue ("Open print queue"). Cancel all stuck documents
4. In the queue window, open the **Printer** menu and untick "Use Printer Offline" and "Pause Printing"
5. Restart the Print Spooler:
   - Press **Win+R**, type **services.msc**
   - Find **Print Spooler**, right-click → **Restart**
6. Print a test page: **Printer properties → Print Test Page**
7. Run the built-in troubleshooter (Settings → System → Troubleshoot → Other troubleshooters → Printer)

## Still offline
- Remove the printer from Windows and add it again
- Download and install the latest driver from the manufacturer's official website for the exact model
- For network printers, if the IP address changed, re-add the printer using the new IP or reserve a fixed IP on the router

## Epson EcoTank (L-series, e.g. L3110 / L3150) notes
- Faint, streaky, or missing colours: run **Nozzle Check**, then **Head Cleaning** from the Epson printer utility (Printer properties → Maintenance). Avoid running many cleanings back-to-back
- Paper and ink lights blinking together can indicate a paper jam or that the ink pads need service — check the Epson status monitor message. Ink pad service should be done by a qualified technician
- Only refill with the correct Epson ink bottles for that model
- For blank pages on an L3110: check ink tanks are not empty, run Nozzle Check → Head Cleaning, print from Notepad to test, update driver from epson.com

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // NO INTERNET / WIFI TROUBLESHOOTING
  // ============================================================
  {
    title: "No Internet / Wi-Fi — Troubleshooting Guide",
    category: "Networking",
    content: `# No Internet / Wi-Fi — Troubleshooting Guide

## Narrow down the problem first
Ask whether the problem affects:
1. Only this computer
2. All computers / phones
3. Wi-Fi only
4. Both Wi-Fi and Ethernet (cable)

- **All devices affected** → problem is likely the router, modem, or ISP
- **Only one device affected** → problem is likely that device's settings, adapter, or driver

## If ALL devices have no internet
1. Restart the modem/router: unplug power for 30 seconds, plug back in, wait 2–3 minutes
2. Check the router lights (Internet/WAN/LOS). A red LOS light usually means a fibre/line fault — contact the ISP
3. Confirm the internet bundle / subscription is active and paid
4. Check cables between the ISP box and the router
5. Contact the ISP if the router shows no internet connection

## If only ONE computer has no internet
1. Make sure Airplane mode is OFF and Wi-Fi is turned on
2. Forget the network and reconnect: **Settings → Network & internet → Wi-Fi → Manage known networks → Forget**, then reconnect with the correct password
3. Run the Network troubleshooter (Settings → System → Troubleshoot → Other troubleshooters)
4. Reset the network stack — open **Command Prompt as Administrator** and run:
   \\\`\\\`\\\`
   ipconfig /release
   ipconfig /renew
   ipconfig /flushdns
   netsh winsock reset
   netsh int ip reset
   \\\`\\\`\\\`
   Then restart the computer
5. Check the network adapter in **Device Manager** (Win+X → Device Manager → Network adapters). If there is a yellow warning icon, update or reinstall the driver
6. Check the date and time are correct (wrong time breaks secure websites)
7. Disable any VPN or proxy temporarily (Settings → Network & internet → Proxy)
8. Last resort: **Settings → Network & internet → Advanced network settings → Network reset**

## Connecting a computer to Wi-Fi (Windows)
1. Click the network icon on the taskbar (bottom-right)
2. Select the Wi-Fi network name (SSID)
3. Tick "Connect automatically" if desired, click Connect
4. Enter the Wi-Fi password and confirm
5. If the network is not listed, check that Wi-Fi is enabled and that the adapter appears in Device Manager

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // SLOW COMPUTER
  // ============================================================
  {
    title: "Slow Computer — Troubleshooting Guide",
    category: "Windows",
    content: `# Slow Computer — Troubleshooting Guide

## Ask first
- Is it slow all the time, only at startup, or only with certain programs/websites?
- When did it start (after an update, new software, virus)?
- Is it a desktop or laptop, and does it have an HDD or SSD?

## Steps
1. Restart the computer (not just sleep)
2. Open **Task Manager** (Ctrl+Shift+Esc) → **Processes**. Sort by CPU, Memory, and Disk to find what is using resources
3. Disable unnecessary startup programs: **Task Manager → Startup apps → Disable**
4. Free disk space: keep at least 15–20% of the system drive free. Use **Settings → System → Storage → Temporary files**, or Disk Cleanup
5. Uninstall programs that are not needed (Settings → Apps)
6. Run a full antivirus scan (Windows Security → Virus & threat protection → Scan options → Full scan)
7. Install pending Windows Updates and restart
8. Check disk health: a constantly 100% busy HDD often indicates an old or failing disk. **Upgrading from HDD to SSD** gives the largest speed improvement on older PCs
9. Check RAM: 4 GB is very limited for Windows 10/11; 8 GB or more is recommended
10. Laptops: check for overheating (blocked vents, dust). Set the power mode to Balanced / Best performance when plugged in

## When to recommend an upgrade or replacement
- HDD → SSD upgrade: the single biggest speed boost for old PCs
- RAM upgrade: if the PC constantly uses >90% of RAM
- If the machine is 8+ years old and slow after all the above, replacement may be cheaper than repair

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // SCANNING & PDF
  // ============================================================
  {
    title: "Scanning Documents and Converting to PDF",
    category: "Office & Documents",
    content: `# Scanning Documents and Converting to PDF

## Scanning a document (Windows)
1. Place the document face down on the scanner glass, aligned to the corner marker
2. Choose a scanning method:
   - **Option A — Windows Scan app:** open "Windows Scan" (install from Microsoft Store if missing), choose the scanner, select file type (PDF or JPEG), colour mode and resolution (300 dpi is good for documents), then click Scan
   - **Option B — Windows Fax and Scan:** Start → Windows Fax and Scan → New Scan
   - **Option C — Manufacturer's software** (Epson Scan 2, HP Smart, Canon IJ Scan Utility): often saves directly as PDF and can scan multiple pages into one PDF
3. Save the file with a clear name and confirm it opens correctly before sending to the customer

## Tips
- Use 200–300 dpi for documents
- Use greyscale for text-only documents to keep file sizes small
- Many online portals limit uploads to 1–2 MB

## Converting a document to PDF
- Microsoft Word / Excel / PowerPoint: **File → Save As** (or **Export**) → choose PDF
- Any program that can print: **Print → choose "Microsoft Print to PDF" → Print** → choose a file name
- Google Docs: **File → Download → PDF Document**
- Images to PDF: select the images in File Explorer → right-click → **Print → "Microsoft Print to PDF"**
- Phones: most scanning apps (Microsoft Lens, Google Drive scan) save as PDF

## Reducing PDF size (for online uploads)
- Re-scan at a lower resolution or in greyscale
- In Word, **File → Save As → PDF → "Minimum size (publishing online)"**
- Use an online PDF compressor if the portal is strict (e.g. 1 MB limit)

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // WINDOWS INSTALL
  // ============================================================
  {
    title: "Installing Windows 10 / 11 from USB",
    category: "Windows",
    content: `# Installing Windows 10 / 11 from USB

## Requirements
- USB flash drive of at least 8 GB (it will be erased)
- Another working PC with internet to create the installer
- **Back up the customer's data first** — a clean install erases the selected drive
- Windows 11 needs TPM 2.0, Secure Boot, a supported CPU, 4 GB RAM, and 64 GB storage. Older PCs may need Windows 10
- A valid Windows licence / product key (many PCs have a digital licence that activates automatically)

## Create the bootable USB
1. Download the official **Media Creation Tool** from microsoft.com/software-download (Windows 10 or Windows 11)
2. Run it, accept the licence, choose **"Create installation media (USB flash drive)"**
3. Select language/edition, choose the USB drive, wait for it to finish

## Install
1. Insert the USB into the target PC and restart
2. Open the **boot menu** (commonly F12, F11, F9, F8, or Esc depending on manufacturer) and choose the USB drive. If needed, enter BIOS/UEFI (F2/Del) and set USB first in boot order
3. Choose language → **Install now**
4. Enter a product key or choose "I don't have a product key" (it can activate later)
5. Choose the edition that matches the licence (e.g. Home or Pro)
6. Select **"Custom: Install Windows only (advanced)"**
7. Select the drive/partition. For a clean install, delete the old Windows partitions on the target disk and select the unallocated space. **Double-check you are not deleting a data drive**
8. Wait for installation; the PC restarts several times. Remove the USB when setup starts the out-of-box experience
9. Complete region, keyboard, network, and account setup

## After installation
- Run **Windows Update** until no updates remain
- Install missing drivers (Device Manager; manufacturer's support site)
- Install antivirus if needed, browsers, office software
- Restore the customer's data from the backup

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // SHA (kept for retrieval — the other SHA article covers registration only)
  // ============================================================
  {
    title: "SHA (Social Health Authority) — Registration Quick Reference",
    category: "Government e-Services",
    content: `# SHA (Social Health Authority) — Registration Quick Reference

**Note:** SHA replaced NHIF in October 2024. Procedures, channels, and contribution rules may change — confirm on the official SHA website (**https://sha.go.ke**) before assisting a customer.

For a full step-by-step guide, see the article **"SHA (Social Health Authority) Registration & Returns"** in the knowledge base.

## Registration channels
- Online self-service portal (sha.go.ke)
- USSD: dial **\\*147#** on a registered Safaricom/Airtel/Telkom line
- Official SHA mobile app
- In person at SHA offices, Huduma Centres, or designated health facilities

## Information / documents needed
- Kenyan National ID number
- A phone number registered in the customer's own name (OTP is sent here)
- Details of household members: spouse ID number, children's birth certificate numbers
- Income information (for contribution means-testing)

## Common problems
- **OTP not received:** confirm the phone number is registered in the customer's name and has network; retry after a few minutes
- **Details not found:** customer's ID details may need verification at an SHA office or Huduma Centre
- **Portal not loading:** try a different browser, clear cache, or try during off-peak hours

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },

  // ============================================================
  // ECITIZEN NOT LOADING (troubleshooting only)
  // ============================================================
  {
    title: "eCitizen / Government Portal Not Loading — Quick Checks",
    category: "Government e-Services",
    content: `# eCitizen / Government Portal Not Loading — Quick Checks

For account creation and password recovery, see the article **"E-Citizen Account — Creation, Login & Password Recovery"**.

## Quick checks
1. Confirm internet works by opening another website (e.g. google.com)
2. Check the address: use **https://accounts.ecitizen.go.ke** or **https://www.ecitizen.go.ke** — beware of fake look-alike sites
3. Try a private/incognito window (Ctrl+Shift+N). If it works there, the problem is cached data or an extension
4. Clear browser cache and cookies for the site (Ctrl+Shift+Delete → Cookies and Cached images)
5. Try a different, updated browser (Chrome, Edge, Firefox)
6. Check the computer's date and time — wrong time causes "Your connection is not private" errors
7. Disable VPN, proxy, or ad-blocking extensions temporarily
8. Flush DNS: open Command Prompt and run **\\\`ipconfig /flushdns\\\`**
9. The portal may be down or under maintenance, especially near deadlines. Wait and retry later, or check official eCitizen / government social media for outage notices

## Login issues
- **Forgotten password:** use "Forgot password" on the login page; the reset link/OTP goes to the registered email/phone
- **OTP not received:** confirm the phone number, check SMS inbox/spam, wait a few minutes before requesting again

## Payments
- Do NOT pay twice if a payment appears pending. Check the invoice status in the account first — payments can take several minutes to reflect
- Keep the M-Pesa/transaction message as proof

## Contact FrankTechSpace
- **Francis:** 0700468158
- **Email:** francisochieng700@gmail.com
- **Payment:** Equity Paybill **247247**, Account **11211**, or send money to **0721971130**`,
  },
];