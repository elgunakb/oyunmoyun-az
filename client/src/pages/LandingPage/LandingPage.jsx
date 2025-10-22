import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import usePageTitle from '../../components/PageTitle';
import Navbar from '../../components/Navbar/Navbar';

const LandingPage = () => {
  usePageTitle('Login — OyunMoyun');
  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
    </div>
  );
};

export default LandingPage;
