/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-fragments */

import React, { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { useSelector } from 'react-redux';

import Article from '../../components/Article';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';
import Loader from '../../components/Loader';

import apiService from '../../services/ApiService';

const ArticleFull = function () {
  const { slug } = useParams(); // получает slug из роутера
  const [item, setItem] = useState({}); // отображаемый элемент
  const [isLoading, setLoading] = useState(true); // отображение лоадера
  const [isError, setIsError] = useState(false); // отобажение ошибки
  const [errorText, setErrorText] = useState(''); // текст ошибки
  const [isSuccess, setIsSuccess] = useState(false); // отобажение успех запроса
  const [controllerShow, setControllerShow] = useState(false);

  const { userData } = useSelector((state) => state.user);
  // console.log(userData.username)

  useEffect(() => {
    // получает статью по slug
    apiService
      .getAarticleFull(slug)
      .then((newItem) => {
        // показывает контроллер если имя username в стор сопадает с автором статьи
        if (userData.username === newItem.author.username) {
          setControllerShow(true);
        }

        setItem(newItem); // изменяет item
        setLoading(false); // отклюает лоадер
        setIsError(false); // флаг ошибки
      })
      .catch(() => {
        setIsError(true); // флаг ошибки
      });

    // console.log('useEffect');
  }, [slug, isLoading, userData]);

  const onCloseMessage = () => {
    setIsError(false); // флаг ошибки
    setErrorText(''); // сообщение ошибки
  };

  const confirmDeletion = () => {
    const token = JSON.parse(localStorage.getItem('token'));
    // удаляет статью
    apiService.deleteArticle(slug, token).then((res) => {
      // если первый символ статуса 2 (OK)
      if (String(res.status)[0] === '2') {
        setIsSuccess(true);
      } else {
        // если нет ошибка
        setErrorText(`error: ${res.status} ${res.statusText}`); // текст ошибки
        setIsError(true); // флаг ошибки
      }
    });
  };

  // отображает индикатор загрузки пока не получена статья
  const loading = isLoading && !isError ? <Loader /> : null;

  // отображает статью если объект не пустой (статья получена)
  const article =
    Object.keys(item).length !== 0 && !isSuccess ? (
      <Article item={item} controllerFlag={controllerShow} confirmDeletion={confirmDeletion} />
    ) : null;

  // соообщение об ошибке
  const errorMasege = isError ? <ErrorMessage description={errorText} callback={onCloseMessage} /> : null;

  // собщение об успехе
  const successMasege =
    isSuccess && !isError ? (
      <SuccessMessage description="Article successfully removed!" callback={onCloseMessage} closable={false} />
    ) : null;

  return (
    <React.Fragment>
      {errorMasege}
      {successMasege}
      {loading}
      {article}
    </React.Fragment>
  );
};

export default ArticleFull;
