Here is the complete and presentable **README.md** file structure for your **Steam Clone Frontend Prototype**, fulfilling all the planning and documentation requirements (Part A and Part B).

-----

# 🎮 Next-Level Steam Store Clone: Frontend Prototype

## 🌟 Project Overview

This project is a highly interactive and responsive frontend prototype simulating the core features of the Steam store. It demonstrates proficiency in structuring complex UI layouts and implementing dynamic client-side interactions using pure JavaScript.

-----

## 👥 Group Members

| Name | Role | Steam Clone |
| :--- | :--- | :--- |
| **[Abdullah Fraz]** | Lead Developer, UI/UX Design, CSS Implementation | `[GitHub_Username_1]` |
| **[Farid Ali]** | Interactivity, State Management, Purchase Logic (JS) | `[GitHub_Username_2]` |


## 🎯 Part A — Project Planning: Modules & Functionality

**Project Theme:** Gaming Distribution Platform (Steam Clone)

| Module/Page Name | Purpose/Functionality | Responsible Group Member(s) |
| :--- | :--- | :--- |
| **Login/Sign-Up** | Handles user mock authentication (login/signup) and persists session status using **Local Storage**. | Member 2 |
| **Store Page** (`index.html`) | Primary content view; features the dynamic **Game Grid**, **Sidebar Navigation**, and **Filtering Controls**. | Member 1, Member 2 |
| **Featured Section** | High-visibility showcase for a single game, including an **Automatic 5-second Image/Video Carousel** (Image slider). | Member 2|
| **Game Detail Modal** | Displays full game information, manages **Wallet/Purchase Simulation**, and handles **External Redirection** ("Add to Cart" link). | Member 2 |
| **User Library** | Displays all **purchased (owned) games** stored in the user's local state. | Member 1, Member 2 |
| **Account Management** | Modal for **Wallet Top-up/Redemption** and **Password Change Simulation**. | Member 1, Member 2 |

-----

## 🛠️ Part B — Frontend Prototype Development

### Design Requirements & Layout

| Requirement | Implementation Detail | Tool(s) Used |
| :--- | :--- | :--- |
| **Layout Method** | Complex **Sidebar** and **Main Content** organization for both Store and Library pages. | **CSS Grid** (for main wrapper) and **Flexbox** (for headers/controls). |
| **Responsiveness** | Fully adapted for mobile, tablet, and desktop views, collapsing the sidebar content vertically on small screens. | **Media Queries** and Flexbox |
| **Styling** | Consistent, dark, high-contrast UI using a Steam-like color palette (`#171a21` background, blue/green accents). | Pure CSS |

### Interactivity Requirements (JavaScript)

| Dynamic Feature | Implementation Detail |
| :--- | :--- |
| **Dynamic Content Display** | **Wallet Display** updated in real-time upon adding funds or purchasing games. |
| **Image Slider / Modal** | **Automatic 5-second Carousel** in the featured section, cycling through video and screenshots. |
| **Live Search/Filter** | Real-time filtering based on **Search Bar input**, **Genre Sidebar links**, and the **Price Range Slider**. |
| **Interactive Navigation** | Tab switching between **Store** and **Library** pages, and the functional **User Profile Dropdown Menu**. |
| **Form Validation** | Mock **Password Change** validation checks old password and new password length/match. |

-----

## 🚀 Running the Project

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/faridali2003/steam_clone]
    ```
2.  **Navigate to the folder:**
    ```bash
    cd [Steam Clone]
    ```
3.  **Launch:** Open the `index.html` file directly in your web browser. *(Using VS Code's "Live Server" extension is recommended for local development.)*
4.  **Test Credentials:**
      * **Username:** `testuser`
      * **Password:** `password`
5.  **Test Wallet:** Access the **Username Menu** -\> **Add Funds / Redeem**. Use code **`GIFT10`** to add $10.00 to your wallet for testing purchases.
