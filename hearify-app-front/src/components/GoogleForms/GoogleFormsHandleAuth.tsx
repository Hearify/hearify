import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import LoadingPage from '@src/pages/LoadingPage/LoadingPage.tsx';
import Spinner from '@src/components/Loaders/Spinner.tsx';

const GoogleFormsHandleAuth = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  function getState(location: string) {
    if (location) return location.slice(location.indexOf('?state=') + '?state='.length, location.indexOf('&code'));
  }

  const location = window.location.href;
  const urlParams = new URLSearchParams(location);

  const code = urlParams.get('code');
  const state = getState(location);
  const classCode = localStorage.getItem('exportFormsClassCode');

  axios
    .post(`/api/google-forms/${classCode}?state=${state}&code=${code}`)
    .then((res) => {
      localStorage.removeItem('exportFormsClassCode');
      if (res.data.status === 200) {
        console.log(res.data.detail);
        setSuccess(true);
      }
    })
    .catch((err) => {
      console.log(err);
      setSuccess(true);
    });

  useEffect(() => {
    if (success) {
      window.open('https://docs.google.com/forms/', '_blank');
      navigate('/login', { state: { googleFormSuccess: success } });
    }
  }, [success]);

  return <LoadingPage />;
};

export default GoogleFormsHandleAuth;
