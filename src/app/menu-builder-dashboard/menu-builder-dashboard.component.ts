import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Observable, Subject, take } from "rxjs";
import { Section } from "../_models/section.model"; // Adjust the path as necessary
import { SectionService } from "../_services/section.service"; // Adjust the path as necessary
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../_dialogs/confirm/confirm-dialog/confirm-dialog.component";
import { MenuItemService } from "../_services/menu-item.service";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { MenuItem } from "../_models/menu-item.model";
import { CreateItemDialogComponent } from "../_dialogs/menu-items/create-item-dialog/create-item-dialog.component";
import { EditItemDialogComponent } from "../_dialogs/menu-items/edit-item-dialog/edit-item-dialog.component";
import { AuthService } from "../_services/auth.service";

@Component({
  selector: "app-menu-builder-dashboard",
  templateUrl: "./menu-builder-dashboard.component.html",
  styleUrls: ["./menu-builder-dashboard.component.scss"],
})
export class MenuBuilderDashboardComponent implements OnInit {
  private destroy$ = new Subject<void>();
  userId: string;
  user: any;
  sections: Section[] = [];
  newSectionName: string = "";
  newSectionDescription: string = "";
  editingSectionId: string | null = null;
  editingSection: Section | null = null;
  showAddSection: boolean = false;

  //Edit Menu Description Section
  editMode = false;
  editedMenuDescription: string;

  //Add On Section
  addingAddOn: string | null = null;
  newAddOnName: string = '';
  newAddOnPrice: number | null = null;

  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "top";

  constructor(
    public afAuth: AngularFireAuth,
    public authService: AuthService,
    private sectionService: SectionService,
    private menuItemService: MenuItemService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private storage: AngularFireStorage,
    private afs: AngularFirestore
  ) {
    this.user = null;
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        let emailLower = user.email.toLowerCase();

        this.authService
          .getCurrentUserInfo(emailLower)
          .subscribe((userInfo) => {
            this.user = userInfo;
            console.log(this.user);
          });

        this.loadSectionsWithMenuItems();
      }
    });
  }

  ngOnDestroy() {
    // Complete the subject to unsubscribe from all observables using takeUntil
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddSectionClick(): void {
    this.showAddSection = true;
  }

  closeSection(): void {
    this.showAddSection = false;
  }

  editSection(sectionId: string): void {
    this.editingSectionId = sectionId;
    this.editingSection = {
      ...this.sections.find((section) => section.id === sectionId),
    };
  }

  addSection(): void {
    if (this.newSectionName) {
      const newSection: Section = {
        uid: this.userId,
        name: this.newSectionName,
        order: this.sections?.length + 1,
        description: this.newSectionDescription.trim() || null,
      };
      this.sectionService.createSection(newSection).then((docRef) => {
        const sectionWithId: Section = { ...newSection, id: docRef.id };
        this.sections.push(sectionWithId);
        this.newSectionName = "";
        this.showAddSection = false;
        this._snackBar.open("Section has been created!", "", {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ["green-snackbar"],
        });
      });
    }
  }

  saveSection(): void {
    if (this.editingSection) {
      this.sectionService.updateSection(this.editingSection).then(() => {
        this.editingSectionId = null;
        const index = this.sections.findIndex(
          (section) => section.id === this.editingSection!.id
        );
        if (index > -1) {
          this.sections[index] = { ...this.editingSection };
        }
        this._snackBar.open("Section has been edited!", "", {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ["yellow-snackbar"],
        });
      });
    }
  }

  deleteSection(sectionId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete this section and all its menu items?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const deletedSection = this.sections.find(
          (section) => section.id === sectionId
        );
        const deletedSectionOrder = deletedSection ? deletedSection.order : 0;

        this.deleteSectionWithItems(sectionId)
          .then(() => {
            this.updateSectionOrdersAfterDeletion(deletedSectionOrder);
            this._snackBar.open(
              "Section and its menu items have been deleted!",
              "",
              {
                horizontalPosition: this.horizontalPosition,
                verticalPosition: this.verticalPosition,
                duration: 2500,
                panelClass: ["red-snackbar"],
              }
            );
          })
          .catch((error) => {
            this._snackBar.open("Error occurred during deletion!", "", {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ["red-snackbar"],
            });
            console.error("Error during deletion:", error);
          });
      }
    });
  }

  moveSection(sectionId: string, direction: "up" | "down"): void {
    const currentSectionIndex = this.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (currentSectionIndex === -1) return;

    const swapSectionIndex =
      direction === "up" ? currentSectionIndex - 1 : currentSectionIndex + 1;
    if (swapSectionIndex < 0 || swapSectionIndex >= this.sections.length)
      return;

    // Swap the order values
    const currentSection = this.sections[currentSectionIndex];
    const swapSection = this.sections[swapSectionIndex];
    [currentSection.order, swapSection.order] = [
      swapSection.order,
      currentSection.order,
    ];

    // Update sections in Firestore
    this.sectionService
      .updateSection(currentSection)
      .catch((error) => console.error("Error updating section:", error));
    this.sectionService
      .updateSection(swapSection)
      .catch((error) => console.error("Error updating section:", error));

    // Reflect the change in the local state
    this.sections[currentSectionIndex] = swapSection;
    this.sections[swapSectionIndex] = currentSection;
  }

  async deleteSectionWithItems(sectionId: string): Promise<void> {
    const menuItems = await this.afs
      .collection<MenuItem>("menuItems", (ref) =>
        ref.where("sectionId", "==", sectionId)
      )
      .get()
      .toPromise();

    // Batch operation starts here
    const batch = this.afs.firestore.batch();

    for (const doc of menuItems.docs) {
      const menuItemId = doc.id;
      const menuItemData = doc.data() as MenuItem;

      if (menuItemData.imageUrl) {
        const imageRef = this.storage.refFromURL(menuItemData.imageUrl);

        try {
          await imageRef.delete().toPromise();
          console.log(`Image deleted: ${menuItemData.imageUrl}`);
        } catch (error) {
          // Only log error, don't throw to continue with batch deletion
          console.error(`Error deleting image: ${error.message}`);
        }
      }

      // Delete document reference in batch
      const menuItemDocRef = this.afs
        .collection("menuItems")
        .doc(menuItemId).ref;
      batch.delete(menuItemDocRef);
    }

    // Delete the section as part of the batch
    const sectionDocRef = this.afs.collection("sections").doc(sectionId).ref;
    batch.delete(sectionDocRef);

    // Commit the batch
    await batch.commit();
  }

  updateSectionOrdersAfterDeletion(deletedSectionOrder: number): void {
    // Filter out the sections that come after the deleted section
    const updatedSections = this.sections.filter(
      (section) => section.order > deletedSectionOrder
    );

    // Update the order of these sections
    updatedSections.forEach((section) => {
      section.order -= 1;
      this.sectionService.updateSection(section).catch((error) => {
        console.error("Error updating section order:", error);
        // Optionally, handle this error in the UI
      });
    });
  }

  cancelEdit(): void {
    this.editingSectionId = null;
    this.editingSection = null;
  }

  updateSectionOrders(): void {
    this.sections.forEach((section, index) => {
      section.order = index + 1;
      this.sectionService.updateSection(section);
    });
  }

  // Method to asynchronously get the count of menu items for a section
  private async getMenuItemsCount(sectionId: string): Promise<number> {
    try {
      const menuItems = await this.menuItemService
        .getMenuItemsForSection(sectionId)
        .pipe(take(1))
        .toPromise();
      return menuItems.length;
    } catch (error) {
      console.error("Error in getMenuItemsCount:", error);
      throw error; // Rethrow error to handle in the calling method
    }
  }

  loadSectionsWithMenuItems(): void {
    this.sectionService
      .getSectionsListForUser(this.userId)
      .subscribe((sectionsData) => {
        this.sections = sectionsData.map((e) => {
          return {
            id: e.payload.doc.id,
            ...(e.payload.doc.data() as Section),
            menuItems: [], // Initialize menuItems array
          };
        });
        this.sections.forEach((section) => {
          this.updateSectionMenuItems(section.id);
        });
      });
  }

  updateSectionMenuItems(sectionId: string): void {
    this.menuItemService
      .getMenuItemsForSection(sectionId)
      .subscribe((menuItems) => {
        const sectionIndex = this.sections.findIndex(
          (section) => section.id === sectionId
        );
        if (sectionIndex > -1) {
          this.sections[sectionIndex].menuItems = menuItems.map((item) => ({
            ...item, // Spread the existing properties
            id: item.id, // Ensure the id is included
          }));
        }
      });
  }

  /*
    MENU ITEM SECTION
  */
  openCreateMenuItemDialog(sectionId: string): void {
    console.log("openCreateMenuItemDialog called for section", sectionId);

    // Call a method to get the count of menu items
    this.getMenuItemsCount(sectionId)
      .then((maxOrder) => {
        const dialogRef = this.dialog.open(CreateItemDialogComponent, {
          data: { sectionId: sectionId, uid: this.userId, maxOrder: maxOrder },
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log("Dialog closed with result:", result);
          if (result?.menuItemCreated) {
            this.updateSectionMenuItems(sectionId);
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching menu items count:", error);
        // Handle error appropriately
      });
  }

  deleteMenuItemWithConfirmation(
    sectionId: string,
    menuItemId: string,
    imageUrl: string | null
  ): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { text: "Are you sure you want to delete this menu item?" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.menuItemService
          .deleteMenuItem(menuItemId, imageUrl)
          .then(() => {
            this._snackBar.open("Menu item deleted!", "", {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ["red-snackbar"],
            });
            this.updateMenuItemsOrderAfterDeletion(sectionId, menuItemId);
          })
          .catch((error) => {
            this._snackBar.open("Error occurred during deletion!", "", {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ["red-snackbar"],
            });
            console.error("Error during deletion:", error);
          });
      }
    });
  }

  updateMenuItemsOrderAfterDeletion(
    sectionId: string,
    deletedItemId: string
  ): void {
    const sectionIndex = this.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (sectionIndex === -1) return;

    // Remove the deleted item from the array and update the order of remaining items
    const updatedMenuItems = this.sections[sectionIndex].menuItems
      .filter((item) => item.id !== deletedItemId)
      .map((item, index) => ({ ...item, order: index + 1 }));

    // Update local state
    this.sections[sectionIndex].menuItems = updatedMenuItems;

    // Update in database
    this.updateMenuItemsOrder(sectionId, updatedMenuItems);
  }

  openEditMenuItemDialog(menuItem: MenuItem, sectionId: string) {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      data: menuItem,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.menuItemUpdated) {
        const sectionIndex = this.sections.findIndex((s) => s.id === sectionId);
        const itemIndex = this.sections[sectionIndex].menuItems.findIndex(
          (i) => i.id === menuItem.id
        );
        if (itemIndex !== -1) {
          this.sections[sectionIndex].menuItems[itemIndex] =
            result.updatedMenuItem;
        }
        this._snackBar.open("Menu item edited!", "", {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ["yellow-snackbar"],
        });
      }
    });
  }

  moveMenuItem(
    menuItemId: string,
    sectionId: string,
    direction: "up" | "down"
  ): void {
    const sectionIndex = this.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (sectionIndex === -1) return;

    let menuItems = [...this.sections[sectionIndex].menuItems];
    const menuItemIndex = menuItems.findIndex((item) => item.id === menuItemId);
    if (menuItemIndex === -1) return;

    if (direction === "up" && menuItemIndex > 0) {
      [menuItems[menuItemIndex], menuItems[menuItemIndex - 1]] = [
        menuItems[menuItemIndex - 1],
        menuItems[menuItemIndex],
      ];
    } else if (direction === "down" && menuItemIndex < menuItems.length - 1) {
      [menuItems[menuItemIndex], menuItems[menuItemIndex + 1]] = [
        menuItems[menuItemIndex + 1],
        menuItems[menuItemIndex],
      ];
    }

    // Update orders after swapping
    menuItems = menuItems.map((item, index) => ({ ...item, order: index + 1 }));

    // Update local state
    this.sections[sectionIndex].menuItems = menuItems;

    // Update in database
    this.updateMenuItemsOrder(sectionId, menuItems);
  }

  updateMenuItemsOrder(
    sectionId: string,
    menuItems: MenuItem[]
  ): Promise<void> {
    const batch = this.afs.firestore.batch();

    menuItems.forEach((item) => {
      const menuItemDocRef = this.afs.collection("menuItems").doc(item.id).ref;
      batch.update(menuItemDocRef, { order: item.order });
    });

    return batch.commit();
  }

  //Edit Menu Description Portion

  editMenuDescription() {
    this.editMode = true;
    this.editedMenuDescription = this.user.menuDescription; // Make a copy to edit
  }

  cancelMenuEdit() {
    this.editMode = false;
  }

  saveMenuDescription() {
    this.authService
      .updateUser(this.user.email, {
        menuDescription: this.editedMenuDescription,
      })
      .then(() => {
        this.user.menuDescription = this.editedMenuDescription; // Update the local user object
        this.editMode = false;
        // Show snackbar notification
        this._snackBar.open("Menu description updated successfully!", "", {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ["green-snackbar"],
        });
      })
      .catch((error) => {
        console.error("Error updating menu description:", error);
        // Optionally show an error notification
      });
  }

  //Add On Section
  saveAddOn(menuItem: MenuItem): void {
    if (!menuItem.addOn) {
      menuItem.addOn = [];
    }
    menuItem.addOn.push({ name: this.newAddOnName, price: this.newAddOnPrice });
    // Update menuItem in Firestore
    this.menuItemService.updateMenuItem(menuItem).then(() => {
      this.addingAddOn = null;
      this.newAddOnName = '';
      this.newAddOnPrice = null;
    }).then(() => {
      this._snackBar.open("You added an add on successfully!", "", {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ["green-snackbar"],
      });
    })
      .catch(error => {
        console.error("Error add on:", error);
      });
  }

  deleteAddOn(menuItem: MenuItem, index: number): void {
    if (!menuItem.addOn || menuItem.addOn.length <= index) {
      return;
    }
    // Remove the add-on at the specified index
    menuItem.addOn.splice(index, 1);
    // Optionally, create a new array to trigger change detection
    menuItem.addOn = [...menuItem.addOn];
    // Update the menuItem in Firestore
    this.menuItemService.updateMenuItem(menuItem).then(() => {
      this._snackBar.open("Add-on removed successfully!", "", {
        duration: 2500,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        panelClass: ["red-snackbar"],
      });
    }).catch(error => {
      console.error("Error removing add-on:", error);
      this._snackBar.open("Failed to remove add-on", "", {
        duration: 2500,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        panelClass: ["red-snackbar"],
      });
    });
  }
}
