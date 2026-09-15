import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/libro-de-reclamaciones",
      method: "POST",
    },
  ],
});
