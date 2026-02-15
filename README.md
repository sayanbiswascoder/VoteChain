# VoteChain

VoteChain is a decentralized voting application built on the **Sepolia Testnet** using **Next.js 15**, **Thirdweb SDK 5**, and **Tailwind CSS**. It allows users to browse active, upcoming, and ended votings, cast votes securely using their wallets, and view real-time results.

## 🌟 Features

- **Decentralized Voting:** Secure voting on the blockchain.
- **Real-time Updates:** View live vote counts and percentages.
- **Voting Statuses:** Filter votings by Upcoming, Active, Ended, and Finalized.
- **Wallet Integration:** Seamless connection with Thirdweb's Connect Wallet.
- **Responsive Design:** Modern, animated UI with Tailwind CSS.

## 🛠 Tech Stack

- **Frontend Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Web3 Integration:** [Thirdweb SDK 5](https://portal.thirdweb.com/)
- **Smart Contracts:** Solidity (Deployed on Sepolia)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A Thirdweb Account & Client ID from the [Thirdweb Dashboard](https://thirdweb.com/dashboard)
- A Web3 wallet (e.g., MetaMask, Coinbase Wallet) with Sepolia ETH

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/votechain.git
    cd votechain
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root directory and add your Thirdweb Client ID:

    ```env
    NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_client_id_here
    NEXT_PUBLIC_FACTORY_ADDRESS=your_factory_address_here
    ```

### Running the App

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Deploying Your Own Contract

1.  Deploy the contract using Thirdweb or your preferred method.
2.  Copy the deployed contract address.
3.  Update the `NEXT_PUBLIC_FACTORY_ADDRESS` in your `.env.local` file with the new address.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
