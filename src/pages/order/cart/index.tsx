import { Box, Typography, Avatar, Button, Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { addons as Addon, orderlines } from "@prisma/client";
import { CartItem } from "@/Types/Types";
import { config } from "@/config/config";
import { getCartTotalPrice } from "@/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromCart, selectCart } from "@/store/slices/cartSlice";
import { addOrder } from "@/store/slices/ordersSlice";
import { toast } from "react-toastify";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { addOrderline, refetchOrderline } from "@/store/slices/orderlinesSlice";

const Review = () => {
  const { items, isLoading } = useAppSelector(selectCart);
  const router = useRouter();
  const query = router.query;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoading && !items.length) {
      const query = router.query;
      const isValid = query.locationId;
      isValid && router.push({ pathname: "/order", query });
    }
  }, [router, items, isLoading]);

  const renderAddons = (addons: Addon[]) => {
    if (!addons.length) return;
    return addons.map((addon) => {
      return (
        <Box
          key={addon.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            color={"primary"}
            className=" text-gray-700 text-sm sm:text-md"
          >
            - {addon.name}
          </Typography>
          <Typography
            color={"primary"}
            className=" text-gray-700 text-sm sm:text-md"
          >
            {addon.price}
          </Typography>
        </Box>
      );
    });
  };

  //remove orderline
  const removeCartItems = (cartItem: CartItem) => {
    dispatch(removeFromCart(cartItem));
  };

  //comform order
  const conformOrder = async () => {
    const { locationId, tableId } = query;
    const isValid = locationId && tableId && items.length;
    if (!isValid) return toast.error("Something went wrong!");

    // const data = await fetch(
    //   `${config.apiBaseUrl}/order?locationId=${locationId}&tableId=${tableId}`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ items }),
    //   }
    // );
    const data = await fetch(
      `/api/order?locationId=${locationId}&tableId=${tableId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }
    );

    const orderCreated = await data.json();
    dispatch(addOrder(orderCreated));

    router.push({
      pathname: `/order/activeCart/${orderCreated.id}`,
      query,
    });
    toast.success("Your order is start now!");
  };

  if (!items.length) return null;

  return (
    <div className="  bg-zinc-100 rounded-lg relative">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 3,
          borderRadius: 10,
          mx: 3,
          mt: 3,
        }}
      >
        <AiOutlineArrowLeft
          size={30}
          cursor="pointer"
          onClick={() => router.back()}
          className=" -ml-2 mr-1 absolute left-4 top-5"
        />
        <Box
          sx={{
            width: { xs: "100%", md: "500px" },
          }}
        >
          <Typography
            variant="h5"
            color="primary"
            sx={{ textAlign: "center", mb: 3, fontSize: { xs: "20px" } }}
          >
            Review your order
          </Typography>
          {items.map((cartItem, index) => {
            const { menu, addons, quantity } = cartItem;
            return (
              <Box key={index}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 20, sm: 30 },
                      height: { xs: 20, sm: 30 },
                      mr: 1,
                      backgroundColor: "#1B9C85",
                      fontSize: { xs: "13px", sm: "18px" },
                    }}
                  >
                    {quantity}x
                  </Avatar>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="black"
                      sx={{ fontSize: { xs: "15px", sm: "20px" } }}
                    >
                      {menu.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontSize: { xs: "13px", sm: "18px" } }}
                    >
                      {menu.price}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    pl: 6,
                  }}
                >
                  {addons && renderAddons(addons)}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 3,
                    mt: 1,
                  }}
                >
                  <DeleteIcon
                    sx={{
                      mr: 2,
                      cursor: "pointer",
                      fontSize: { xs: 15, sm: 20, md: 25 },
                    }}
                    onClick={() => removeCartItems(cartItem)}
                  />
                  <EditIcon
                    sx={{
                      cursor: "pointer",
                      fontSize: { xs: 15, sm: 20, md: 25 },
                    }}
                    onClick={() =>
                      router.push({
                        pathname: `menuUpdate/${cartItem.id}`,
                        query: router.query,
                      })
                    }
                  />
                </Box>
                <hr className=" border-b border-gray-500 mb-3" />
              </Box>
            );
          })}
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Typography
              variant="h4"
              color="primary"
              sx={{ fontSize: { xs: 20, sm: 30 } }}
            >
              Total: {getCartTotalPrice(items)}
            </Typography>
          </Box>
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              sx={{ fontSize: { xs: 13, sm: 15 } }}
              onClick={conformOrder}
              className=" bg-blue-950"
            >
              Confirm order
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default Review;
