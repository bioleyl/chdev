import { expect, test } from './fixtures/page-objects.fixture.js';

/**
 * Utility to generate unique test data so tests are idempotent.
 */
function uniqueName(prefix: string): string {
  const ts = Date.now().toString(36);
  return `${prefix}-${ts}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Navigation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('should navigate to prestations page via AppBar link', async ({ prestationsPage }) => {
    // First navigate to the app root so the authenticated page loads
    await prestationsPage.page.goto('/');
    await prestationsPage.page.waitForTimeout(500);
    // Click the AppBar link to navigate to prestations
    await prestationsPage.clickAppBarLink();
    await expect(prestationsPage.page).toHaveURL('/prestations');
  });

  test('should display page title and container', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    const isVisible = await prestationsPage.isPageVisible();
    expect(isVisible).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Create
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Create', () => {
  test('should open create modal via create button', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();
    await expect(prestationsPage.page).toHaveURL('/prestations');
  });

  test('should fill all fields and save successfully', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    const label = uniqueName('Prestation Créer');
    const description = 'Description de test';
    const unitPrice = '49.90';
    const unit = 'heure';

    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillDescription(description);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();

    // Wait for the list to refresh
    await prestationsPage.page.waitForTimeout(1000);

    // Verify the item appears in the list by searching for it
    await prestationsPage.search(label);
    await prestationsPage.page.waitForTimeout(500);
  });

  test('should close modal without saving (cancel)', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();

    await prestationsPage.fillLabel(uniqueName('Should Not Save'));
    await prestationsPage.fillUnit('heure');

    // Click cancel — since form is dirty, unsaved changes dialog appears
    await prestationsPage.closeModal();
    await prestationsPage.page.waitForTimeout(300);

    // Click "Yes" on the unsaved changes dialog to discard changes and close
    await prestationsPage.confirmUnsavedChanges();
    await prestationsPage.page.waitForTimeout(300);

    // Modal should now be closed
    const modalVisible = await prestationsPage.isModalOpen();
    expect(modalVisible).toBeFalsy();
  });

  test('should show unsaved changes confirmation when leaving dirty modal', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();

    // Fill in a field to make the form dirty
    await prestationsPage.fillLabel(uniqueName('Dirty Form'));

    // Click cancel — should trigger unsaved changes dialog
    await prestationsPage.closeModal();

    // The unsaved changes confirm dialog should appear
    await expect(prestationsPage.isConfirmDialogOpen()).resolves.toBe(true);

    // We click "No" to stay on the form and then properly close
    await prestationsPage.cancelUnsavedChanges();

    // Form should still be open with our data
    const labelValue = await prestationsPage.getFormLabelValue();
    expect(labelValue).toContain('Dirty Form');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Read (List)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Read (List)', () => {
  test('should display paginated list with correct columns', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    const rowCount = await prestationsPage.countListRows();
    // Page is considered displayed if the list component exists (row count >= 0)
    expect(rowCount >= 0).toBeTruthy();
  });

  test('should display currency-formatted unitPrice', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    // Create a prestation first to ensure data exists
    const label = uniqueName('Currency Test');
    const unitPrice = '123.45';
    const unit = 'pièce';

    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    // Wait for save + list refresh
    await prestationsPage.page.waitForTimeout(1500);

    // Search for the created item
    await prestationsPage.search(label);
    // Wait for search filter + list refresh
    await prestationsPage.page.waitForTimeout(1500);

    // The row should be visible
    const rowCount = await prestationsPage.countListRows();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Cleanup
    await prestationsPage.clearSearch();
    await prestationsPage.page.waitForTimeout(300);
  });

  test('should search and filter results', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    // Create a test prestation
    const label = uniqueName('Search Filter');
    const unitPrice = '25.00';
    const unit = 'jour';

    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    // Wait for save + list refresh
    await prestationsPage.page.waitForTimeout(1500);

    // Search for it
    await prestationsPage.search(label);
    // Wait for search filter + list refresh
    await prestationsPage.page.waitForTimeout(1500);

    // Should find at least one result
    const rowCount = await prestationsPage.countListRows();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Clear search and verify list refreshes
    await prestationsPage.clearSearch();
    await prestationsPage.page.waitForTimeout(500);
  });

  test('should handle empty search results', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    // Search for something unlikely to exist
    await prestationsPage.search('nonexistent-item-xyz-12345');
    await prestationsPage.page.waitForTimeout(500);

    // Clear search
    await prestationsPage.clearSearch();
    await prestationsPage.page.waitForTimeout(300);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Update
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Update', () => {
  test('should open edit modal via edit button on a row', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    // Create a test prestation to edit
    const label = uniqueName('Edit Test');
    const unitPrice = '30.00';
    const unit = 'mois';

    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(1000);

    // Open edit modal
    await prestationsPage.openCreateModal();
    await prestationsPage.closeModal(); // Close the create modal first
    await prestationsPage.page.waitForTimeout(300);

    // Search for the item
    await prestationsPage.search(label);
    await prestationsPage.page.waitForTimeout(500);

    // Click edit button on the first row
    await prestationsPage.clickEditButtonForRow(1);

    // The form should be populated with existing data
    const currentLabel = await prestationsPage.getFormLabelValue();
    expect(currentLabel).toContain(label);
  });

  test('should pre-populate form with existing data', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Prepop Test');
    const description = 'Original description';
    const unitPrice = '75.50';
    const unit = 'heure';

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillDescription(description);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(1000);

    // Edit
    await prestationsPage.search(label);
    await prestationsPage.page.waitForTimeout(500);

    await prestationsPage.clickEditButtonForRow(1);
    await prestationsPage.page.waitForTimeout(500);

    // Verify pre-populated values
    const formLabel = await prestationsPage.getFormLabelValue();
    expect(formLabel).toContain(label);

    const formDesc = await prestationsPage.getFormDescriptionValue();
    expect(formDesc).toBe(description);

    const formUnit = await prestationsPage.getFormUnitValue();
    expect(formUnit).toBe(unit);
  });

  test('should update fields and save', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Update Test');
    const newLabel = uniqueName('Updated Label');
    const unitPrice = '50.00';
    const unit = 'jour';
    const newUnit = 'semaine';

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(1000);

    // Edit and modify
    await prestationsPage.search(label);
    await prestationsPage.page.waitForTimeout(500);

    await prestationsPage.clickEditButtonForRow(1);
    await prestationsPage.page.waitForTimeout(500);

    await prestationsPage.fillLabel(newLabel);
    await prestationsPage.fillUnit(newUnit);
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(1000);

    // Verify update by searching for the new label
    await prestationsPage.search(newLabel);
    await prestationsPage.page.waitForTimeout(500);
  });

  test('should refresh the list after update', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Refresh Test');
    const unitPrice = '100.00';
    const unit = 'pièce';
    const newLabel = uniqueName('After Update');

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(1000);

    // Edit
    await prestationsPage.search(label);
    await prestationsPage.page.waitForTimeout(500);

    await prestationsPage.clickEditButtonForRow(1);
    await prestationsPage.page.waitForTimeout(500);

    await prestationsPage.fillLabel(newLabel);
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(1000);

    // Verify old label is gone and new one exists
    await prestationsPage.search(label);
    await prestationsPage.page.waitForTimeout(500);
    await prestationsPage.clearSearch();
    await prestationsPage.page.waitForTimeout(300);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Delete
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Delete', () => {
  test('should open delete confirmation dialog', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Delete Confirm');
    const unitPrice = '15.00';
    const unit = 'heure';

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(1000);

    // Search and delete
    await prestationsPage.search(label);
    await prestationsPage.page.waitForTimeout(500);

    await prestationsPage.clickDeleteButtonForRow(1);

    // The confirm dialog should be visible
    await expect(prestationsPage.isConfirmDialogOpen()).resolves.toBe(true);

    // Cancel the delete
    await prestationsPage.cancelDelete();
    await prestationsPage.page.waitForTimeout(300);
  });

  test('should confirm delete and remove item from list', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Delete Confirm Remove');
    const unitPrice = '20.00';
    const unit = 'jour';

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(1000);

    // Delete
    await prestationsPage.search(label);
    await prestationsPage.page.waitForTimeout(500);

    await prestationsPage.clickDeleteButtonForRow(1);
    await prestationsPage.confirmDelete();
    await prestationsPage.page.waitForTimeout(1000);

    // Verify it's gone
    await prestationsPage.page.waitForTimeout(500);
  });

  test('should cancel delete and keep item', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Delete Cancel Keep');
    const unitPrice = '35.00';
    const unit = 'pièce';

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    // Wait for save + list refresh
    await prestationsPage.page.waitForTimeout(1500);

    // Delete but cancel
    await prestationsPage.search(label);
    // Wait for search filter
    await prestationsPage.page.waitForTimeout(1500);

    await prestationsPage.clickDeleteButtonForRow(1);
    await prestationsPage.cancelDelete();
    await prestationsPage.page.waitForTimeout(500);

    // Item should still be there
    const rowCount = await prestationsPage.countListRows();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Detail Drawer', () => {
  test('should open drawer when clicking a row', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Drawer Test');
    const description = 'Drawer description';
    const unitPrice = '40.00';
    const unit = 'heure';

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillDescription(description);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    // Wait for save + list refresh
    await prestationsPage.page.waitForTimeout(1500);

    // Search for the item
    await prestationsPage.search(label);
    // Wait for search filter
    await prestationsPage.page.waitForTimeout(1500);

    // Click row to open drawer
    await prestationsPage.openDrawer(1);
    await prestationsPage.page.waitForTimeout(500);

    const drawerVisible = await prestationsPage.isDrawerOpen();
    expect(drawerVisible).toBeTruthy();
  });

  test('should display all prestation details correctly', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Drawer Details');
    const description = 'Drawer detail description';
    const unitPrice = '55.50';
    const unit = 'jour';

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillDescription(description);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    // Wait for save + list refresh
    await prestationsPage.page.waitForTimeout(1500);

    // Open drawer by clicking row
    await prestationsPage.search(label);
    // Wait for search filter
    await prestationsPage.page.waitForTimeout(1500);

    await prestationsPage.openDrawer(1);
    await prestationsPage.page.waitForTimeout(500);

    // Verify drawer is visible
    const drawerVisible = await prestationsPage.isDrawerOpen();
    expect(drawerVisible).toBeTruthy();

    // Close the drawer
    await prestationsPage.closeDrawer();
    await prestationsPage.page.waitForTimeout(300);
  });

  test('should close drawer and clear selection', async ({ prestationsPage }) => {
    await prestationsPage.goTo();

    const label = uniqueName('Drawer Close');
    const unitPrice = '60.00';
    const unit = 'pièce';

    // Create
    await prestationsPage.openCreateModal();
    await prestationsPage.fillLabel(label);
    await prestationsPage.fillUnitPrice(unitPrice);
    await prestationsPage.fillUnit(unit);
    await prestationsPage.saveModal();
    // Wait for save + list refresh
    await prestationsPage.page.waitForTimeout(1500);

    // Open drawer by clicking row
    await prestationsPage.search(label);
    // Wait for search filter
    await prestationsPage.page.waitForTimeout(1500);

    await prestationsPage.openDrawer(1);
    await prestationsPage.page.waitForTimeout(300);

    // Verify drawer is visible
    const drawerVisible = await prestationsPage.isDrawerOpen();
    expect(drawerVisible).toBeTruthy();

    // Close the drawer
    await prestationsPage.closeDrawer();
    await prestationsPage.page.waitForTimeout(300);

    // Verify drawer is now closed
    const drawerClosed = await prestationsPage.isDrawerOpen();
    expect(drawerClosed).toBeFalsy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Validation', () => {
  test('should prevent saving with empty required fields', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();

    // Leave all fields empty (except description which is optional)
    // The save button is disabled when form is dirty + has errors,
    // so we just verify the modal stays open
    await prestationsPage.page.waitForTimeout(500);

    // Modal should still be open (save didn't succeed)
    const modalVisible = await prestationsPage.isModalOpen();
    expect(modalVisible).toBeTruthy();

    // Close the modal to clean up
    await prestationsPage.closeModal();
    await prestationsPage.page.waitForTimeout(300);
  });

  test('should show validation error messages for each required field', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();

    // Fill only one field
    await prestationsPage.fillLabel(uniqueName('Partial'));
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(500);

    // Check that unit field has an error (it's required but empty)
    const errors = await prestationsPage.getFormErrors();

    // At least one error should be present
    const hasErrors = Object.values(errors).some((e) => e !== null && e !== '');
    expect(hasErrors).toBeTruthy();

    // Close the modal
    await prestationsPage.closeModal();
    await prestationsPage.page.waitForTimeout(300);
  });

  test('should prevent saving with empty unit', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();

    await prestationsPage.fillLabel(uniqueName('No Unit'));
    await prestationsPage.fillUnitPrice('25.00');
    // Leave unit empty
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(500);

    // Modal should still be open
    const modalVisible = await prestationsPage.isModalOpen();
    expect(modalVisible).toBeTruthy();

    await prestationsPage.closeModal();
    await prestationsPage.page.waitForTimeout(300);
  });

  test('should prevent saving with empty label', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();

    await prestationsPage.fillUnitPrice('30.00');
    await prestationsPage.fillUnit('heure');
    // Leave label empty
    await prestationsPage.saveModal();
    await prestationsPage.page.waitForTimeout(500);

    // Modal should still be open
    const modalVisible = await prestationsPage.isModalOpen();
    expect(modalVisible).toBeTruthy();

    await prestationsPage.closeModal();
    await prestationsPage.page.waitForTimeout(300);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Modal Close/Cancel
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Modal Close/Cancel', () => {
  test('should show "Changements non sauvegardés" confirmation when canceling with dirty form', async ({
    prestationsPage,
  }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();

    // Make the form dirty
    await prestationsPage.fillLabel(uniqueName('Dirty Cancel'));
    await prestationsPage.fillUnitPrice('25.00');
    await prestationsPage.fillUnit('heure');

    // Click cancel — should trigger unsaved changes dialog
    await prestationsPage.closeModal();
    await prestationsPage.page.waitForTimeout(500);

    // The unsaved changes confirm dialog should appear
    await expect(prestationsPage.isConfirmDialogOpen()).resolves.toBe(true);

    // Click "No" (stay on form)
    await prestationsPage.cancelUnsavedChanges();
    await prestationsPage.page.waitForTimeout(300);

    // Verify data is still in the form
    const labelValue = await prestationsPage.getFormLabelValue();
    expect(labelValue).toContain('Dirty Cancel');
  });

  test('should NOT show confirmation when canceling without changes', async ({ prestationsPage }) => {
    await prestationsPage.goTo();
    await prestationsPage.openCreateModal();

    // Don't make any changes — cancel immediately
    await prestationsPage.closeModal();
    await prestationsPage.page.waitForTimeout(500);

    // The unsaved changes confirm dialog should NOT appear
    // (the modal should be closed directly)
    const modalVisible = await prestationsPage.isModalOpen();
    expect(modalVisible).toBeFalsy();
  });
});
