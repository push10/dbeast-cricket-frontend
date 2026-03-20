import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  createMatchExpense,
  getCompletedMatches,
  getMatchFinanceOverview,
  recalculateMatchFinance,
  upsertMatchContribution,
} from "../api/matchApi";
import { getApiErrorMessage } from "../utils/apiErrors";

const EMPTY_EXPENSE_FORM = {
  category: "MATCH_FEE",
  title: "",
  totalAmount: "",
  allocationMode: "ALL_AVAILABLE",
  participantPlayerIds: [],
};

const EMPTY_CONTRIBUTION_FORM = {
  playerId: "",
  amount: "",
};

const EMPTY_DISCOUNT_FORM = {
  playerId: "",
  amount: "",
};

const EXPENSE_CATEGORY_OPTIONS = [
  { value: "MATCH_FEE", label: "Match Fee" },
  { value: "TEA", label: "Tea" },
  { value: "BOOST", label: "Boost" },
  { value: "SNACKS", label: "Snacks" },
  { value: "OTHER", label: "Other" },
];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Date not available";

export default function MatchLedger({ currentUser }) {
  const [completedMatches, setCompletedMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [finance, setFinance] = useState(null);
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE_FORM);
  const [contributionForm, setContributionForm] = useState(EMPTY_CONTRIBUTION_FORM);
  const [discountForm, setDiscountForm] = useState(EMPTY_DISCOUNT_FORM);
  const [expenseDiscounts, setExpenseDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingExpense, setSavingExpense] = useState(false);
  const [savingContribution, setSavingContribution] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedMatch = useMemo(
    () => completedMatches.find((match) => String(match.id) === selectedMatchId) || null,
    [completedMatches, selectedMatchId]
  );

  const canManageSelectedMatch = useMemo(() => {
    if (!selectedMatch) {
      return false;
    }

    return (currentUser?.teams || []).some(
      (team) =>
        team.role === "CAPTAIN" &&
        (team.teamName === selectedMatch.teamA || team.teamName === selectedMatch.teamB)
    );
  }, [currentUser?.teams, selectedMatch]);

  useEffect(() => {
    async function loadCompletedMatches() {
      if (!currentUser?.id) {
        return;
      }

      setLoading(true);

      try {
        const matches = await getCompletedMatches(currentUser.id);
        setCompletedMatches(matches);
        setSelectedMatchId(matches[0] ? String(matches[0].id) : "");
        setErrorMessage("");
      } catch (err) {
        console.error("Failed to load completed matches", err);
        setErrorMessage(getApiErrorMessage(err, "Could not load ledger"));
      } finally {
        setLoading(false);
      }
    }

    loadCompletedMatches();
  }, [currentUser?.id]);

  useEffect(() => {
    async function loadFinance() {
      if (!selectedMatchId) {
        setFinance(null);
        setContributionForm(EMPTY_CONTRIBUTION_FORM);
        return;
      }

      try {
        const response = await getMatchFinanceOverview(selectedMatchId);
        setFinance(response);
        setContributionForm((prev) => ({
          ...prev,
          playerId: prev.playerId || String(response.players[0]?.playerId || ""),
        }));
        setErrorMessage("");
      } catch (err) {
        console.error("Failed to load match finance", err);
        setFinance(null);
        setErrorMessage(getApiErrorMessage(err, "Could not load match finance"));
      }
    }

    loadFinance();
  }, [selectedMatchId]);

  const handleExpenseChange = (event) => {
    const { name, value } = event.target;
    setExpenseForm((prev) => {
      if (name === "category" && value === "MATCH_FEE") {
        return { ...prev, category: value, allocationMode: "ALL_AVAILABLE" };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleContributionChange = (event) => {
    const { name, value } = event.target;
    setContributionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiscountChange = (event) => {
    const { name, value } = event.target;
    setDiscountForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantSelection = (event) => {
    const participantPlayerIds = Array.from(event.target.selectedOptions, (option) => Number(option.value));
    setExpenseForm((prev) => ({ ...prev, participantPlayerIds }));
  };

  const addDiscount = () => {
    if (!discountForm.playerId || discountForm.amount === "") {
      setErrorMessage("Select a player and discount amount");
      return;
    }

    const playerId = Number(discountForm.playerId);
    const amount = Number(discountForm.amount);

    setExpenseDiscounts((prev) => [
      ...prev.filter((discount) => discount.playerId !== playerId),
      {
        playerId,
        playerName:
          finance?.players?.find((player) => player.playerId === playerId)?.playerName || "Player",
        amount,
      },
    ]);
    setDiscountForm(EMPTY_DISCOUNT_FORM);
    setErrorMessage("");
  };

  const removeDiscount = (playerId) => {
    setExpenseDiscounts((prev) => prev.filter((discount) => discount.playerId !== playerId));
  };

  const handleCreateExpense = async () => {
    if (!selectedMatchId) {
      setErrorMessage("Select a completed match first");
      return;
    }

    if (!expenseForm.title.trim() || !expenseForm.totalAmount) {
      setErrorMessage("Title and amount are required");
      return;
    }

    setSavingExpense(true);

    try {
      await createMatchExpense(selectedMatchId, {
        title: expenseForm.title.trim(),
        category: expenseForm.category,
        mandatoryForAvailablePlayers: expenseForm.allocationMode === "ALL_AVAILABLE",
        totalAmount: Number(expenseForm.totalAmount),
        participantPlayerIds:
          expenseForm.allocationMode === "SELECTED_PLAYERS" ? expenseForm.participantPlayerIds : [],
        discounts: expenseDiscounts.map((discount) => ({
          playerId: discount.playerId,
          amount: discount.amount,
        })),
      });

      const refreshed = await getMatchFinanceOverview(selectedMatchId);
      setFinance(refreshed);
      setExpenseForm(EMPTY_EXPENSE_FORM);
      setExpenseDiscounts([]);
      setDiscountForm(EMPTY_DISCOUNT_FORM);
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to create expense", err);
      setErrorMessage(getApiErrorMessage(err, "Could not create expense"));
    } finally {
      setSavingExpense(false);
    }
  };

  const handleSaveContribution = async () => {
    if (!selectedMatchId) {
      setErrorMessage("Select a completed match first");
      return;
    }

    if (!contributionForm.playerId || contributionForm.amount === "") {
      setErrorMessage("Player and amount are required");
      return;
    }

    setSavingContribution(true);

    try {
      await upsertMatchContribution(selectedMatchId, {
        playerId: Number(contributionForm.playerId),
        amount: Number(contributionForm.amount),
      });

      const refreshed = await getMatchFinanceOverview(selectedMatchId);
      setFinance(refreshed);
      setContributionForm((prev) => ({ ...prev, amount: "" }));
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to save contribution", err);
      setErrorMessage(getApiErrorMessage(err, "Could not save contribution"));
    } finally {
      setSavingContribution(false);
    }
  };

  const handleRecalculate = async () => {
    if (!selectedMatchId) {
      setErrorMessage("Select a completed match first");
      return;
    }

    setRecalculating(true);

    try {
      const refreshed = await recalculateMatchFinance(selectedMatchId);
      setFinance(refreshed);
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to recalculate match finance", err);
      setErrorMessage(getApiErrorMessage(err, "Could not recalculate ledger"));
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <Stack spacing={6}>
      <Box>
        <Heading size="lg">Match Ledger</Heading>
        <Text color="gray.600">
          Record completed-match expenses, collect player contributions, and track settlement balance.
        </Text>
      </Box>

      {errorMessage && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Box borderWidth={1} borderRadius="lg" p={5}>
          <FormControl>
            <FormLabel>Completed Match</FormLabel>
            <Select
              placeholder={loading ? "Loading completed matches..." : "Select a completed match"}
              value={selectedMatchId}
              onChange={(event) => setSelectedMatchId(event.target.value)}
              isDisabled={loading || completedMatches.length === 0}
            >
              {completedMatches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.teamA} vs {match.teamB} - {formatDate(match.matchDate)}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box borderWidth={1} borderRadius="lg" p={5}>
          <Text fontSize="sm" color="gray.500">
            Captain Access
          </Text>
          <Heading size="md" mt={1}>
            {canManageSelectedMatch ? "Finance entry enabled" : "View only"}
          </Heading>
          <Badge mt={2} colorScheme={canManageSelectedMatch ? "green" : "gray"}>
            {canManageSelectedMatch ? "Captain of selected match" : "Not a captain for this match"}
          </Badge>
          {canManageSelectedMatch && selectedMatch && (
            <Button mt={4} size="sm" variant="outline" onClick={handleRecalculate} isLoading={recalculating}>
              Recalculate Ledger
            </Button>
          )}
        </Box>
      </SimpleGrid>

      {!selectedMatch ? (
        <Box borderWidth={1} borderRadius="lg" p={6}>
          <Text color="gray.500">
            No completed matches available yet. Once a captain marks a match completed, it will
            appear here for finance tracking.
          </Text>
        </Box>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Box borderWidth={1} borderRadius="lg" p={5}>
              <Text fontSize="sm" color="gray.500">Fixture</Text>
              <Heading size="sm" mt={1}>{selectedMatch.teamA} vs {selectedMatch.teamB}</Heading>
            </Box>
            <Box borderWidth={1} borderRadius="lg" p={5}>
              <Text fontSize="sm" color="gray.500">Total Expenses</Text>
              <Heading size="sm" mt={1}>{formatCurrency(finance?.summary?.totalExpenses)}</Heading>
            </Box>
            <Box borderWidth={1} borderRadius="lg" p={5}>
              <Text fontSize="sm" color="gray.500">Total Contributions</Text>
              <Heading size="sm" mt={1}>{formatCurrency(finance?.summary?.totalContributions)}</Heading>
            </Box>
            <Box borderWidth={1} borderRadius="lg" p={5}>
              <Text fontSize="sm" color="gray.500">Balance Difference</Text>
              <Heading size="sm" mt={1}>
                {finance?.summary?.balanceDifference > 0 ? "+" : ""}
                {formatCurrency(finance?.summary?.balanceDifference)}
              </Heading>
            </Box>
          </SimpleGrid>

          {canManageSelectedMatch && (
            <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
              <GridItem>
                <Box borderWidth={1} borderRadius="lg" p={6}>
                  <Heading size="md" mb={4}>Add Expense</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1.4fr 1fr" }} gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Category</FormLabel>
                        <Select
                          name="category"
                          value={expenseForm.category}
                          onChange={handleExpenseChange}
                        >
                          {EXPENSE_CATEGORY_OPTIONS.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Expense Title</FormLabel>
                        <Input
                          name="title"
                          placeholder="Tea, Ground Fees, Boost"
                          value={expenseForm.title}
                          onChange={handleExpenseChange}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Total Amount</FormLabel>
                        <Input
                          name="totalAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={expenseForm.totalAmount}
                          onChange={handleExpenseChange}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 2fr auto" }} gap={4} mt={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Allocation</FormLabel>
                        <Select
                          name="allocationMode"
                          value={expenseForm.allocationMode}
                          onChange={handleExpenseChange}
                          isDisabled={expenseForm.category === "MATCH_FEE"}
                        >
                          <option value="ALL_AVAILABLE">All Available Players</option>
                          <option value="SELECTED_PLAYERS">Selected Players Only</option>
                        </Select>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Optional Participants</FormLabel>
                        <Select
                          multiple
                          height="140px"
                          value={expenseForm.participantPlayerIds.map(String)}
                          onChange={handleParticipantSelection}
                          isDisabled={expenseForm.allocationMode === "ALL_AVAILABLE"}
                        >
                          {(finance?.players || []).map((player) => (
                            <option key={player.playerId} value={player.playerId}>
                              {player.playerName} - {player.teamName}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>
                    <GridItem display="flex" alignItems="end">
                      <Button colorScheme="blue" onClick={handleCreateExpense} isLoading={savingExpense} w="full">
                        Save Expense
                      </Button>
                    </GridItem>
                  </Grid>

                  <Box mt={6}>
                    <Heading size="sm" mb={3}>Player Discounts</Heading>
                    <Grid templateColumns={{ base: "1fr", md: "2fr 1fr auto" }} gap={4}>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Player</FormLabel>
                          <Select
                            name="playerId"
                            value={discountForm.playerId}
                            onChange={handleDiscountChange}
                          >
                            <option value="">Select player</option>
                            {(finance?.players || []).map((player) => (
                              <option key={player.playerId} value={player.playerId}>
                                {player.playerName} - {player.teamName}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Discount Amount</FormLabel>
                          <Input
                            name="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={discountForm.amount}
                            onChange={handleDiscountChange}
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem display="flex" alignItems="end">
                        <Button variant="outline" onClick={addDiscount} w="full">
                          Add Discount
                        </Button>
                      </GridItem>
                    </Grid>

                    {expenseDiscounts.length > 0 && (
                      <Stack spacing={2} mt={4}>
                        {expenseDiscounts.map((discount) => (
                          <Stack
                            key={discount.playerId}
                            direction="row"
                            justify="space-between"
                            align="center"
                            borderWidth={1}
                            borderRadius="md"
                            p={3}
                          >
                            <Text>
                              {discount.playerName}: {formatCurrency(discount.amount)}
                            </Text>
                            <Button size="sm" variant="ghost" onClick={() => removeDiscount(discount.playerId)}>
                              Remove
                            </Button>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
              </GridItem>

              <GridItem>
                <Box borderWidth={1} borderRadius="lg" p={6}>
                  <Heading size="md" mb={4}>Record Contribution</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "2fr 1fr auto" }} gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Player</FormLabel>
                        <Select
                          name="playerId"
                          value={contributionForm.playerId}
                          onChange={handleContributionChange}
                        >
                          {(finance?.players || []).map((player) => (
                            <option key={player.playerId} value={player.playerId}>
                              {player.playerName} - {player.teamName}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Amount</FormLabel>
                        <Input
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={contributionForm.amount}
                          onChange={handleContributionChange}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem display="flex" alignItems="end">
                      <Button
                        colorScheme="green"
                        onClick={handleSaveContribution}
                        isLoading={savingContribution}
                        w="full"
                      >
                        Save Contribution
                      </Button>
                    </GridItem>
                  </Grid>
                </Box>
              </GridItem>
            </Grid>
          )}

          <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
            <GridItem>
              <Box borderWidth={1} borderRadius="lg" p={6}>
                <Heading size="md" mb={4}>Expenses</Heading>
                {!finance?.expenses?.length ? (
                  <Text color="gray.500">No expenses recorded for this match yet.</Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Title</Th>
                          <Th>Category</Th>
                          <Th>Type</Th>
                          <Th isNumeric>Total</Th>
                          <Th isNumeric>Split</Th>
                          <Th isNumeric>Per Player</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {finance.expenses.map((expense) => (
                          <Tr key={expense.id}>
                            <Td>{expense.title}</Td>
                            <Td>{expense.category}</Td>
                            <Td>{expense.mandatoryForAvailablePlayers ? "Mandatory" : "Optional"}</Td>
                            <Td isNumeric>{formatCurrency(expense.totalAmount)}</Td>
                            <Td isNumeric>{expense.splitCount}</Td>
                            <Td isNumeric>{formatCurrency(expense.perPlayerAmount)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </GridItem>

            <GridItem>
              <Box borderWidth={1} borderRadius="lg" p={6}>
                <Heading size="md" mb={4}>Contributions</Heading>
                {!finance?.contributions?.length ? (
                  <Text color="gray.500">No contributions recorded for this match yet.</Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Player</Th>
                          <Th isNumeric>Amount</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {finance.contributions.map((contribution) => (
                          <Tr key={contribution.id}>
                            <Td>{contribution.playerName}</Td>
                            <Td isNumeric>{formatCurrency(contribution.amount)}</Td>
                            <Td>{formatDate(contribution.contributionDate)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </GridItem>
          </Grid>

          <Box borderWidth={1} borderRadius="lg" p={6}>
            <Heading size="md" mb={4}>Player Settlement</Heading>
            {!finance?.players?.length ? (
              <Text color="gray.500">No players available for this match.</Text>
            ) : (
              <>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Player</Th>
                        <Th>Team</Th>
                        <Th isNumeric>Payable</Th>
                        <Th isNumeric>Contribution</Th>
                        <Th isNumeric>Match Balance</Th>
                        <Th isNumeric>Wallet Balance</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {finance.players.map((player) => (
                        <Tr key={player.playerId}>
                          <Td>
                            <Stack direction="row" spacing={2} align="center">
                              <Text>{player.playerName}</Text>
                              {player.playerId === currentUser?.id && <Badge colorScheme="blue">You</Badge>}
                            </Stack>
                          </Td>
                          <Td>{player.teamName}</Td>
                          <Td isNumeric>{formatCurrency(player.payableAmount)}</Td>
                          <Td isNumeric>{formatCurrency(player.contributionAmount)}</Td>
                          <Td isNumeric>{formatCurrency(player.matchBalance)}</Td>
                          <Td isNumeric>{formatCurrency(player.walletBalance)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>

                <Divider my={4} />
                <Stack direction="row" justify="space-between">
                  <Text fontWeight="semibold">Settlement Difference</Text>
                  <Text fontWeight="bold">
                    {finance?.summary?.balanceDifference > 0 ? "+" : ""}
                    {formatCurrency(finance?.summary?.balanceDifference)}
                  </Text>
                </Stack>
              </>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}
