"use client";

import { getCountryFlag } from "@/lib/countries";
import {
  ChevronRight,
  Globe,
  Inbox,
  Phone,
  PlusCircle,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Contact {
  _id: string;
  name: string;
  phone: string;
  country: string;
  createdAt: string;
}

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contacts")
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.contacts);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <User className="w-7 h-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Saved Contacts</h2>
        </div>
        <Link
          href="/dashboard/contacts/new"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Contact
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border border-dashed border-yellow-300">
          <Inbox className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-yellow-800">
            No contacts yet
          </h3>
          <p className="mt-1 text-sm text-yellow-600">
            Start adding your audience to use them in campaigns.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl shadow border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">
                  <Phone className="inline w-4 h-4 text-yellow-500 mr-1" />
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">
                  <Globe className="inline w-4 h-4 text-blue-500 mr-1" />
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {contact.phone}
                  </td>
                  <td className="emoji px-6 py-4 text-sm text-gray-800">
                    {getCountryFlag(contact.country)} {contact.country}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/contacts/${contact._id}`}
                      className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1 text-sm"
                    >
                      View <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
