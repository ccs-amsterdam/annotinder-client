"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LoginForm = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.json.stringify.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.match.js");

var _react = _interopRequireWildcard(require("react"));

var _Backend = _interopRequireWildcard(require("../../../classes/Backend"));

var _semanticUiReact = require("semantic-ui-react");

var _reactCookie = require("react-cookie");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const useBackend = urlHost => {
  var _cookies$backend3;

  const [cookies, setCookies] = (0, _reactCookie.useCookies)(["backend"]);
  const [backend, setBackend] = (0, _react.useState)(null);
  console.log(cookies);
  (0, _react.useEffect)(() => {
    var _cookies$backend, _cookies$backend2;

    // First check for host in URL, if missing, check for host in cookies.
    const host = urlHost || (cookies === null || cookies === void 0 ? void 0 : (_cookies$backend = cookies.backend) === null || _cookies$backend === void 0 ? void 0 : _cookies$backend.host) || null;
    if (host && host !== (backend === null || backend === void 0 ? void 0 : backend.host)) setBackend(null); // reset backend if host changes

    if (backend || !host || !(cookies !== null && cookies !== void 0 && (_cookies$backend2 = cookies.backend) !== null && _cookies$backend2 !== void 0 && _cookies$backend2.token)) return;
    logIn(cookies, setCookies, setBackend);
  }, [cookies, backend, urlHost, setCookies, setBackend]);
  return [backend, /*#__PURE__*/_react.default.createElement(LoginForm, {
    host: urlHost || (cookies === null || cookies === void 0 ? void 0 : (_cookies$backend3 = cookies.backend) === null || _cookies$backend3 === void 0 ? void 0 : _cookies$backend3.host) || null
  })];
};

const logIn = async (cookies, setCookies, setBackend) => {
  var _cookies$backend4, _cookies$backend5, _cookies$backend6;

  const backend = new _Backend.default(cookies === null || cookies === void 0 ? void 0 : (_cookies$backend4 = cookies.backend) === null || _cookies$backend4 === void 0 ? void 0 : _cookies$backend4.host, cookies === null || cookies === void 0 ? void 0 : (_cookies$backend5 = cookies.backend) === null || _cookies$backend5 === void 0 ? void 0 : _cookies$backend5.email, cookies === null || cookies === void 0 ? void 0 : (_cookies$backend6 = cookies.backend) === null || _cookies$backend6 === void 0 ? void 0 : _cookies$backend6.token);

  try {
    // maybe add check for specific user later. For now just check if can get token
    await backend.init();
    setBackend(backend);
  } catch (e) {
    console.log(e);
    setBackend(null);
    setCookies("backend", JSON.stringify(_objectSpread(_objectSpread({}, backend), {}, {
      token: null
    })), {
      path: "/"
    });
  }
};

const LoginForm = _ref => {
  let {
    host = null
  } = _ref;
  const [cookies, setCookies] = (0, _reactCookie.useCookies)(["backend"]);
  const backend = cookies.backend || {
    host: "http://localhost:5000",
    email: "test@user.com",
    token: null
  };
  if (host) backend.host = host;

  const setLogin = value => {
    setCookies("backend", JSON.stringify(value), {
      path: "/"
    });
  };

  const setLogout = () => {
    setCookies("backend", JSON.stringify(_objectSpread(_objectSpread({}, backend), {}, {
      token: null
    })), {
      path: "/"
    });
  };

  if (backend.token) return /*#__PURE__*/_react.default.createElement(SignOut, {
    backend: backend,
    setLogout: setLogout
  });
  return /*#__PURE__*/_react.default.createElement(SignIn, {
    backend: backend,
    setLogin: setLogin
  });
};

exports.LoginForm = LoginForm;

const SignOut = _ref2 => {
  let {
    backend,
    setLogout
  } = _ref2;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid, {
    textAlign: "center"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    secondary: true,
    onClick: setLogout
  }, "Sign out from ", /*#__PURE__*/_react.default.createElement("span", {
    style: {
      color: "lightblue"
    }
  }, backend.email)))));
};

const SignIn = _ref3 => {
  let {
    backend,
    setLogin
  } = _ref3;
  const [host, setHost] = (0, _react.useState)("");
  const [email, setEmail] = (0, _react.useState)("");
  const [password, setPassword] = (0, _react.useState)("");
  const [invalidPassword, setInvalidPassword] = (0, _react.useState)(false);

  const passwordLogin = async () => {
    setPassword("");

    try {
      const token = await (0, _Backend.getToken)(host, email, password);
      setLogin({
        host,
        email,
        token
      });
    } catch (e) {
      setInvalidPassword(true);
      console.log(e);
    }
  };

  const emailError = !email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  (0, _react.useEffect)(() => {
    if (backend !== null && backend !== void 0 && backend.email) setEmail(backend.email);
    if (backend !== null && backend !== void 0 && backend.host) setHost(backend.host);
  }, [backend]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Header, {
    icon: "user",
    content: "Register or sign in"
  }), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Segment, {
    placeholder: true,
    attached: "bottom"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid, {
    stackable: true,
    textAlign: "center"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Row, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form.Input, {
    placeholder: "Host",
    name: "host",
    label: "Host",
    value: host,
    onChange: (e, d) => {
      if (d.value.length < 100) setHost(d.value);
    },
    icon: "home",
    iconPosition: "left",
    autoFocus: true
  }), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form.Input, {
    placeholder: "email adress",
    error: emailError ? "Please enter a valid email adress" : false,
    name: "email",
    label: "Email",
    icon: "mail",
    iconPosition: "left",
    value: email,
    onChange: (e, d) => {
      if (d.value.length < 100) setEmail(d.value);
    }
  }))))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Divider, null), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid, {
    columns: 2,
    textAlign: "center"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Row, {
    verticalAlign: "middle"
  }, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    circular: true,
    primary: true,
    fluid: true,
    style: {
      width: "7em",
      height: "7em"
    }
  }, "Login by email (not yet functional)"))), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Divider, {
    vertical: true
  }, "Or"), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Grid.Column, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form, null, /*#__PURE__*/_react.default.createElement(_semanticUiReact.Form.Input, {
    placeholder: "password",
    name: "password",
    error: invalidPassword ? "Invalid password for this host & email" : false,
    label: "Password",
    type: "password",
    icon: "lock",
    iconPosition: "left",
    value: password,
    onChange: (e, d) => {
      setInvalidPassword(false);
      setPassword(d.value);
    }
  }), /*#__PURE__*/_react.default.createElement(_semanticUiReact.Button, {
    disabled: password.length === 0,
    primary: true,
    fluid: true,
    onClick: passwordLogin
  }, "Sign in")))))));
};

var _default = useBackend;
exports.default = _default;