import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/libro-de-reclamaciones",
      method: "POST",
    },
    {
      path: "/login",
      method: "POST",
    },
    {
      path: "/recuperar-contrasena",
      method: "POST",
    },
    {
      path: "/restablecer-contrasena",
      method: "POST",
    },
  ],
});
