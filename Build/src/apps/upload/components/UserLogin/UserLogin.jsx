/**
 * Created by jacob.mendt@pikobytes.de on 28.07.23
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { testCredentials } from "../../utils/apiUpload.js";
import { translate } from "../../../../util/util.js";
import "./UserLogin.scss";

export default function UserLogin(props) {
  const { credentials, onLogin } = props;
  const [username, setUsername] = useState(
    credentials !== null ? credentials.username : ""
  );
  const [password, setPassword] = useState(
    credentials !== null ? credentials.password : ""
  );
  const [errorMsg, setErrorMsg] = useState(null);
  const isLoggedIn = useMemo(() => credentials !== null, [credentials]);

  // Handler for updating username
  const handleChangeUsername = (e) => setUsername(e.target.value);

  // Handler for updating username
  const handleChangePassword = (e) => setPassword(e.target.value);

  // Check if we can log in
  const handleLogin = async () => {
    if (username.length > 0 && password.length > 0) {
      const response = await testCredentials(username, password);
      setErrorMsg(response.msg);
      // Dispatch to hoc
      onLogin(
        response.credentialsValid
          ? {
              username: username,
              password: password,
            }
          : null
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-form">
      {!isLoggedIn && errorMsg === null && (
        <p className="bg-info">{translate("searchmap-upload-login-info")}</p>
      )}
      {isLoggedIn && (
        <p className="bg-success">
          {translate("searchmap-upload-login-success").replace(
            "%REPLACE%",
            username
          )}
        </p>
      )}
      {!isLoggedIn && errorMsg !== null && (
        <p className="bg-danger">
          {translate("searchmap-upload-login-danger")}
        </p>
      )}

      <div className="form-inline">
        <div className="form-group ">
          <label htmlFor="validationDefaultUsername">Name:</label>
          <input
            type="text"
            className="form-control"
            id="validationDefaultUsername"
            placeholder="Username"
            value={username}
            onChange={handleChangeUsername}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="loginInputPassword">Password:</label>
          <input
            type="password"
            className="form-control"
            id="loginInputPassword"
            placeholder="Password"
            value={password}
            onChange={handleChangePassword}
            required
            onKeyDown={handleKeyDown}
          />
        </div>
        <button type="submit" className="btn btn-primary" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

UserLogin.propTypes = {
  credentials: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }),
  onLogin: PropTypes.func.isRequired,
};
