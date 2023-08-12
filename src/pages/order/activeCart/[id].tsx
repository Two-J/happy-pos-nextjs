import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { appData } from "@/store/slices/appSlice";
import { emptyCart, selectCart } from "@/store/slices/cartSlice";
import { Box, Paper, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import cooking from "@/assets/cooking.gif";
import Image from "next/image";
import { orderlines, orders } from "@prisma/client";
import Loading from "@/Components/Loading";
import { config } from "@/config/config";

const ActiveOrder = () => {
  const router = useRouter();
  const { query } = router;
  const orderId = query.id as string;
  const dispatch = useAppDispatch();
  const { orders, menus, addons, orderlines } = useAppSelector(appData);
  const order = orders.find((item) => item.id === Number(orderId)) as orders;
  const { items } = useAppSelector(selectCart);

  useEffect(() => {
    if (!order) {
      router.push({ pathname: "/order", query });
    }
  }, [order, query, router]);

  // useEffect(() => {
  //   dispatch(emptyCart());
  // }, []);

  useEffect(() => {
    console.log("orderlines", orderlines);
  }, [orderlines]);

  setTimeout(async () => {
    const response = await fetch(
      `${config.apiBaseUrl}/orderlines?orderId=${orderId}`
    );
    const data = await response.json();

    console.log("refetch", data);
  }, 1000 * 60);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          mt: -2,
        }}
      >
        <Image src={cooking} alt="cooking" width={250} />
      </Box>
      <Box className=" flex mt-3 flex-wrap justify-center">
        {items && order
          ? items.map((item) => (
              <Paper
                sx={{
                  width: 300,
                  mx: 3,
                  display: "flex",
                  flexDirection: "column",
                  p: 2,
                  mb: 3,
                }}
                key={item.id}
              >
                <Typography variant="h5">menu: {item.menu.name}</Typography>
                <Typography variant="h5">quantity: {item.quantity}</Typography>
                <Typography variant="h5">TotalPrice:{order.price}</Typography>
              </Paper>
            ))
          : null}
      </Box>
    </Box>
  );
};

export default ActiveOrder;
