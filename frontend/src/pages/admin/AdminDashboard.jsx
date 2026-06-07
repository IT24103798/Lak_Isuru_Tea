import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";
import { getAllProducts } from "../../services/productService";
import "../../styles/AdminProducts.css";

const LOW_STOCK_LIMIT = 5;

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const getRecentDayLabels = (dayCount) => {
  const today = new Date();

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (dayCount - 1 - index));

    return {
      key: formatDateKey(date),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });
};

const getRecentMonthLabels = (monthCount) => {
  const today = new Date();

  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (monthCount - 1 - index), 1);

    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });
};

const getOrderItemQuantity = (order) =>
  (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedRevenueYear, setSelectedRevenueYear] = useState(
    new Date().getFullYear()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dashboardSummary = useMemo(() => {
    const revenueOrders = orders.filter(
      (order) => !["cancelled", "returned"].includes(order.status)
    );

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: revenueOrders.reduce(
        (total, order) => total + Number(order.totalPrice || 0),
        0
      ),
      pendingOrders: orders.filter((order) => order.status === "processing").length,
    };
  }, [orders, products]);

  const lowStockProducts = useMemo(
    () =>
      products
        .filter((product) => Number(product.stock || 0) <= LOW_STOCK_LIMIT)
        .sort((firstProduct, secondProduct) => {
          return Number(firstProduct.stock || 0) - Number(secondProduct.stock || 0);
        }),
    [products]
  );

  const salesCharts = useMemo(() => {
    const revenueOrders = orders.filter(
      (order) => !["cancelled", "returned"].includes(order.status)
    );
    const dayLabels = getRecentDayLabels(7);
    const monthLabels = getRecentMonthLabels(6);

    const weeklySales = dayLabels.map((day) => {
      const value = revenueOrders
        .filter((order) => formatDateKey(new Date(order.createdAt)) === day.key)
        .reduce((total, order) => total + getOrderItemQuantity(order), 0);

      return { ...day, value };
    });

    const monthlyRevenue = monthLabels.map((month) => {
      const value = revenueOrders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          const monthKey = `${orderDate.getFullYear()}-${String(
            orderDate.getMonth() + 1
          ).padStart(2, "0")}`;

          return monthKey === month.key;
        })
        .reduce((total, order) => total + Number(order.totalPrice || 0), 0);

      return { ...month, value };
    });

    const ordersPerDay = dayLabels.map((day) => {
      const value = orders.filter(
        (order) => formatDateKey(new Date(order.createdAt)) === day.key
      ).length;

      return { ...day, value };
    });

    return { weeklySales, monthlyRevenue, ordersPerDay };
  }, [orders]);

  const revenueYearOptions = useMemo(() => {
    const years = orders
      .map((order) => new Date(order.createdAt).getFullYear())
      .filter((year) => Number.isFinite(year));

    return [...new Set([new Date().getFullYear(), ...years])].sort(
      (firstYear, secondYear) => secondYear - firstYear
    );
  }, [orders]);

  const monthlyRevenueTable = useMemo(() => {
    const revenueOrders = orders.filter(
      (order) => !["cancelled", "returned"].includes(order.status)
    );

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const value = revenueOrders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);

          return (
            orderDate.getFullYear() === Number(selectedRevenueYear) &&
            orderDate.getMonth() === monthIndex
          );
        })
        .reduce((total, order) => total + Number(order.totalPrice || 0), 0);

      return {
        key: `${selectedRevenueYear}-${String(monthIndex + 1).padStart(2, "0")}`,
        label: new Date(selectedRevenueYear, monthIndex, 1).toLocaleDateString(
          "en-US",
          { month: "long" }
        ),
        value,
      };
    });
  }, [orders, selectedRevenueYear]);

  const chartCards = [
    {
      title: "Weekly Sales",
      subtitle: "Units sold over the last 7 days",
      data: salesCharts.weeklySales,
      formatValue: (value) => `${value}`,
    },
    {
      title: "Orders Per Day",
      subtitle: "Order count over the last 7 days",
      data: salesCharts.ordersPerDay,
      formatValue: (value) => `${value}`,
    },
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [productsData, ordersResponse] = await Promise.all([
          getAllProducts({ includeHidden: true }),
          API.get("/orders/admin/all"),
        ]);

        setProducts(productsData.products || []);
        setOrders(ordersResponse.data.orders || []);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    const timerId = setTimeout(loadDashboardData, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Review store performance and manage what customers see first.</p>
        </div>
        <Link className="admin-header-action" to="/admin/products">
          Manage Products
        </Link>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-summary-grid" aria-label="Store summary">
        <article className="admin-summary-card">
          <span>Total Products</span>
          <strong>{loading ? "..." : dashboardSummary.totalProducts}</strong>
        </article>
        <article className="admin-summary-card">
          <span>Total Revenue</span>
          <strong>
            {loading
              ? "..."
              : `Rs. ${dashboardSummary.totalRevenue.toLocaleString()}`}
          </strong>
        </article>
        <article className="admin-summary-card">
          <span>Pending Orders</span>
          <strong>{loading ? "..." : dashboardSummary.pendingOrders}</strong>
        </article>
      </section>

      <section className="admin-top-selling-card">
        <div className="admin-section-heading">
          <div>
            <h2>Low Stock Products</h2>
            <p>Products with {LOW_STOCK_LIMIT} or fewer units remaining.</p>
          </div>
        </div>

        {loading ? (
          <p className="admin-muted-text">Checking stock levels...</p>
        ) : lowStockProducts.length === 0 ? (
          <p className="admin-muted-text">No low stock products right now.</p>
        ) : (
          <div className="low-stock-admin-grid">
            {lowStockProducts.map((product) => (
              <article className="low-stock-admin-item" key={product._id}>
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.src = "/images/lak-isuru-logo.png";
                  }}
                />
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.category || "Uncategorized"}</p>
                </div>
                <span
                  className={
                    Number(product.stock || 0) === 0
                      ? "low-stock-badge out-of-stock"
                      : "low-stock-badge low-stock"
                  }
                >
                  {Number(product.stock || 0) === 0
                    ? "Out of stock"
                    : `${product.stock} left`}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-analytics-card">
        <div className="admin-section-heading">
          <div>
            <h2>Sales Chart</h2>
            <p>Quick view of sales, revenue, and daily order movement.</p>
          </div>
        </div>

        {loading ? (
          <p className="admin-muted-text">Loading chart data...</p>
        ) : (
          <div className="admin-chart-grid">
            {chartCards.map((chart) => {
              const maxValue = Math.max(...chart.data.map((item) => item.value), 1);

              return (
                <article className="admin-chart-card" key={chart.title}>
                  <div className="admin-chart-heading">
                    <h3>{chart.title}</h3>
                    <p>{chart.subtitle}</p>
                  </div>

                  <div className="admin-bar-chart">
                    {chart.data.map((item) => {
                      const height = Math.max((item.value / maxValue) * 100, item.value ? 8 : 2);

                      return (
                        <div className="admin-bar-column" key={item.key}>
                          <span className="admin-bar-value">
                            {chart.formatValue(item.value)}
                          </span>
                          <div className="admin-bar-track">
                            <span style={{ height: `${height}%` }} />
                          </div>
                          <strong>{item.label}</strong>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && (
          <div className="admin-revenue-table-card">
            <div className="admin-revenue-table-heading">
              <div className="admin-chart-heading">
                <h3>Monthly Revenue Table</h3>
                <p>Total revenue by month, excluding cancelled and returned orders.</p>
              </div>

              <label>
                Select year
                <select
                  value={selectedRevenueYear}
                  onChange={(event) =>
                    setSelectedRevenueYear(Number(event.target.value))
                  }
                >
                  {revenueYearOptions.map((year) => (
                    <option value={year} key={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-revenue-table-wrap">
              <table className="admin-revenue-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenueTable.map((month) => (
                    <tr key={month.key}>
                      <td>{month.label}</td>
                      <td>Rs. {month.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

export default AdminDashboard;
