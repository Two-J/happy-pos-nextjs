import { useEffect, useState } from "react";

import { Autocomplete, Box, Button, Checkbox, TextField } from "@mui/material";
import { useRouter } from "next/router";
import Layout from "@/Components/Layout";
import { config } from "@/config/config";
import {
  getAddonCategoryByMenuId,
  getLocationId,
  getMenuCategoryIdByLocationId,
} from "@/utils";
import {
  menus as Menu,
  addon_categories as AddonCategory,
} from "@prisma/client";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteDialog from "@/Components/DeleteDialog";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { appData } from "@/store/slices/appSlice";
import { removeMenu, updateMenu } from "@/store/slices/menusSlice";
import { fetchMenusMenuCategoriesLocations } from "@/store/slices/menusMenuCategoriesLocationsSlice";

const MenuDetails = () => {
  const { menus, addonCategories, menuAddons } = useAppSelector(appData);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const menuId = router.query.id as string;

  const selectedLocationId = getLocationId() as string;
  const [open, setOpen] = useState(false);

  const mappedAddonCategories = addonCategories.map((item) => ({
    id: item.id,
    label: item.name,
  }));

  const menu = menus.find((menu) => menu.id === parseInt(menuId, 10)) as Menu;

  const [newMenu, setNewMenu] = useState({
    id: "",
    name: "",
    price: 0,
    addonCategoryIds: [] as number[],
  });

  useEffect(() => {
    menu &&
      setNewMenu({
        id: menuId,
        name: menu.name,
        price: menu.price,
        addonCategoryIds: [],
      });
  }, [menu, menuId]);

  const selectedAddonCategories = getAddonCategoryByMenuId(
    addonCategories,
    menuId,
    menuAddons
  ).map((item) => ({ id: item.id, label: item.name }));

  //update
  const handleUpdateMenu = async () => {
    const response = await fetch(`${config.apiBaseUrl}/menus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMenu),
    });
    const updatedMenu = await response.json();
    dispatch(updateMenu(updatedMenu));
    dispatch(fetchMenusMenuCategoriesLocations(selectedLocationId));
    router.back();
    //  fetchData();
  };

  //delete menu || archive
  const deleteMenu = async () => {
    await fetch(`${config.apiBaseUrl}/menus?id=${menuId}`, {
      method: "DELETE",
    });
    // fetchData();
    dispatch(removeMenu(menu));
    dispatch(fetchMenusMenuCategoriesLocations(selectedLocationId));

    setOpen(false);
    router.back();
  };

  if (!menu) return null;

  return (
    <Layout title="Menu-Details">
      <Box sx={{ p: 3, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={() => setOpen(true)}
            variant="contained"
            sx={{
              backgroundColor: "#820000",
              ":hover": { bgcolor: "#820000" },
            }}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </Box>
        <TextField
          sx={{ mb: 2, width: "50%" }}
          label="Name"
          defaultValue={menu.name}
          onChange={(evt) => setNewMenu({ ...newMenu, name: evt.target.value })}
        />
        <TextField
          sx={{ mb: 2, width: "50%" }}
          label="Price"
          defaultValue={menu.price}
          type="number"
          onChange={(evt) =>
            setNewMenu({ ...newMenu, price: parseInt(evt.target.value, 10) })
          }
        />
        <Autocomplete
          disablePortal
          multiple
          options={mappedAddonCategories}
          defaultValue={selectedAddonCategories}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(e, v) => {
            const addonCategoryIds = v.map((item) => item.id);
            setNewMenu({ ...newMenu, addonCategoryIds });
          }}
          sx={{ width: 500, mb: 3 }}
          renderInput={(params) => (
            <TextField {...params} label="Addon-Categories" />
          )}
        />
        <Button
          variant="contained"
          onClick={handleUpdateMenu}
          sx={{ width: "fit-content", mt: 3 }}
        >
          Update
        </Button>
      </Box>
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        title="menu"
        deleteFun={deleteMenu}
      />
    </Layout>
  );
};

export default MenuDetails;
