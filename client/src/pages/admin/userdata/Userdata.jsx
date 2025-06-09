import React from "react";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
} from "@/features/api/authApi";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const UserTable = () => {
  const { data, isLoading, error } = useGetAllUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId).unwrap();
        toast.success("User deleted successfully");
      } catch (err) {
        toast.error("Failed to delete user");
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold mt-10">
        ⚠️ Error fetching users
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-tr from-gray-50 via-white to-gray-100 dark:from-zinc-900 dark:to-black rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-primary" /> All Users
        </h2>
        <span className="text-sm text-muted-foreground">
          Total: {data?.users?.length || 0}
        </span>
      </div>

      {/* Desktop/Table view */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <Table className="min-w-[750px]">
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users?.map((user, index) => (
              <TableRow
                key={user._id}
                className="hover:bg-accent transition duration-200"
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-semibold">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wide ${
                      user.role === "admin"
                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {user.status || "Active"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    disabled={isDeleting}
                    onClick={() => handleDelete(user._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {data?.users?.map((user, index) => (
          <div
            key={user._id}
            className="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">{user.name}</span>
              <span className="text-sm text-muted-foreground">#{index + 1}</span>
            </div>

            <div className="text-sm text-muted-foreground mb-1">
              <strong>Email: </strong> {user.email}
            </div>

            <div className="mb-1">
              <strong>Role: </strong>
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wide ${
                  user.role === "admin"
                    ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="mb-2">
              <strong>Status: </strong>
              <span className="text-sm text-muted-foreground">
                {user.status || "Active"}
              </span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              disabled={isDeleting}
              onClick={() => handleDelete(user._id)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTable;
