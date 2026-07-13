import Header from "../Components/Header";
import { Head } from "@inertiajs/react";

const About = () => {
  return (
    <>
      <Head title={"About"} />
      <Header />
      <div className="px-16 mx-auto container p-4">
        <h1>About</h1>
        <p>I love Coding</p>
      </div>
    </>
  );
};

export default About;
