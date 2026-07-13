import { Head } from "@inertiajs/react";
import Header from "../Components/Header";

const Home = ({ users }) => {
  return (
    <>
      <Head title={"Home"} />
      <Header />
      <div className="container mx-auto px-16 py-4">
        <p>Welcome</p>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>
        <p> Coding gives me joy</p>
      </div>
    </>
  );
};

export default Home;
